const express = require("express");
const { protect } = require("../middleware/auth");
const AIReport = require("../models/AIReport");
const GuidanceHistory = require("../models/GuidanceHistory");
const AIResult = require("../models/AIResult");
const DailySummary = require("../models/DailySummary");
const Medication = require("../models/Medication");
const HealthProfile = require("../models/HealthProfile");
const Simulation = require("../models/Simulation");
const Adherence = require("../models/Adherence");
const User = require("../models/User");
const MedicalReport = require("../models/MedicalReport");
const aiService = require("../services/aiService");
const logger = require("../utils/logger");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// ─── Full Analysis ───
/**
 * @swagger
 * /api/ai/full-analysis:
 *   post:
 *     summary: Generate full AI medication analysis
 *     tags: [AI]
 */
router.post("/full-analysis", protect, async (req, res, next) => {
  const { medications, age, weight, gender, conditions, allergies } = req.body;
  if (!medications || !Array.isArray(medications) || medications.length === 0) {
    return res.status(400).json({ message: "At least one medication is required." });
  }

  const profile = { age, weight, gender, conditions, allergies };

  try {
    const { data: aiResponse, riskScore, numericRiskScore } = await aiService.generateFullAnalysis(profile, medications);

    const report = await AIReport.create({
      userId: req.user,
      inputData: { profile, medications },
      aiResponse,
      riskScore,
      numericRiskScore,
      reportType: "full-analysis",
    });

    // Backwards compat
    await AIResult.create({
      user: req.user,
      type: "guidance",
      medications: medications.map(m => typeof m === "string" ? m : m.name),
      dosagePlan: aiResponse.dosage_plan,
      interactions: aiResponse.interactions,
      context: profile,
    }).catch(() => {}); // silent fail if schema changed

    logger.info(`[AI] Full analysis completed for user ${req.user}`);
    res.json({ ...aiResponse, _id: report._id, riskScore, numericRiskScore });
  } catch (error) {
    next(error);
  }
});

// ─── AI Health Risk Score (NEW) ───
/**
 * @swagger
 * /api/ai/risk-score:
 *   post:
 *     summary: Calculate AI health risk score (0-100)
 *     tags: [AI]
 */
router.post("/risk-score", protect, async (req, res, next) => {
  try {
    const medications = await Medication.find({ user: req.user, active: true }).lean();
    const profile = await HealthProfile.findOne({ user: req.user }).lean() || {};
    const totalMissed = medications.reduce((sum, m) => sum + (m.missedCount || 0), 0);

    const riskResult = await aiService.calculateRiskScore(profile, medications, totalMissed);
    logger.info(`[AI] Risk score calculated for user ${req.user}: ${riskResult.score}`);
    res.json(riskResult);
  } catch (error) {
    next(error);
  }
});

// ─── Smart Missed Dose Recovery (NEW) ───
/**
 * @swagger
 * /api/ai/missed-dose:
 *   post:
 *     summary: Get AI advice for a missed medication dose
 *     tags: [AI]
 */
router.post("/missed-dose", protect, async (req, res, next) => {
  const { medicationId, hoursLate } = req.body;
  if (!medicationId) return res.status(400).json({ message: "Medication ID required" });

  try {
    const medication = await Medication.findOne({ _id: medicationId, user: req.user }).lean();
    if (!medication) return res.status(404).json({ message: "Medication not found" });

    const profile = await HealthProfile.findOne({ user: req.user }).lean() || {};
    const advice = await aiService.getMissedDoseAdvice(medication, hoursLate || 2, profile);

    // Update missed count
    await Medication.findByIdAndUpdate(medicationId, { $inc: { missedCount: 1 } });

    logger.info(`[AI] Missed dose advice for ${medication.name}: ${advice.action}`);
    res.json({ medication: medication.name, ...advice });
  } catch (error) {
    next(error);
  }
});

// ─── Medication Combination Optimizer (NEW) ───
/**
 * @swagger
 * /api/ai/optimize-schedule:
 *   post:
 *     summary: Optimize medication schedule to reduce conflicts
 *     tags: [AI]
 */
router.post("/optimize-schedule", protect, async (req, res, next) => {
  try {
    const medications = await Medication.find({ user: req.user, active: true }).lean();
    if (medications.length === 0) return res.status(400).json({ message: "No active medications to optimize" });

    const profile = await HealthProfile.findOne({ user: req.user }).lean() || {};
    const result = await aiService.optimizeMedicationSchedule(medications, profile);

    logger.info(`[AI] Schedule optimized for user ${req.user}: ${result.total_daily_slots} slots`);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ─── AI Daily Health Summary (NEW) ───
/**
 * @swagger
 * /api/ai/daily-summary:
 *   get:
 *     summary: Get or generate today's AI health summary
 *     tags: [AI]
 */
router.get("/daily-summary", protect, async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Check if summary already exists for today
    let existing = await DailySummary.findOne({ userId: req.user, date: today }).lean();
    if (existing) return res.json(existing);

    // Generate fresh
    const medications = await Medication.find({ user: req.user, active: true }).lean();
    const profile = await HealthProfile.findOne({ user: req.user }).lean() || {};
    const totalMissed = medications.reduce((s, m) => s + (m.missedCount || 0), 0);

    const aiSummary = await aiService.generateDailySummary(profile, medications, totalMissed);

    const summary = await DailySummary.findOneAndUpdate(
      { userId: req.user, date: today },
      {
        userId: req.user,
        date: today,
        summary: {
          totalMedications: medications.length,
          medicationNames: medications.map(m => m.name),
          riskScore: aiSummary.risk_score,
          riskLevel: aiSummary.risk_level,
          interactionsFound: 0,
          missedDoses: totalMissed,
          adherenceRate: Math.max(0, 100 - totalMissed * 10),
          aiNarrative: aiSummary.narrative,
          optimizedSchedule: aiSummary.optimized_schedule.map(s => ({
            timeSlot: s.time_slot,
            medications: s.medications,
            instructions: s.instructions,
          })),
          tips: aiSummary.tips,
        },
        alerts: aiSummary.emergency_alerts.map(a => ({
          type: a.severity === "critical" ? "emergency" : "info",
          severity: a.severity,
          title: a.title,
          message: a.message,
          actionRequired: a.action_required,
        })),
      },
      { upsert: true, new: true }
    );

    logger.info(`[AI] Daily summary generated for user ${req.user}`);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// ─── Mark Medication as Taken ───
/**
 * @swagger
 * /api/ai/mark-taken:
 *   post:
 *     summary: Mark a medication as taken today
 *     tags: [AI]
 */
router.post("/mark-taken", protect, async (req, res, next) => {
  const { medicationId } = req.body;
  try {
    const med = await Medication.findOneAndUpdate(
      { _id: medicationId, user: req.user },
      { takenToday: true, lastTaken: new Date() },
      { new: true }
    );
    if (!med) return res.status(404).json({ message: "Medication not found" });

    // Gamification System: Increment streak and save Adherence record
    const today = new Date().toISOString().split("T")[0];
    
    // Write adherence log
    await Adherence.findOneAndUpdate(
      { userId: req.user, medicationId, date: today },
      { status: "taken" },
      { upsert: true, new: true }
    );

    // Update user streak if this is the first med taken today
    const user = await User.findById(req.user);
    if (user && user.lastAdherenceDate !== today) {
      // Check if they took something yesterday to maintain streak
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      if (user.lastAdherenceDate === yesterday) {
        user.streakCount += 1;
      } else if (user.lastAdherenceDate !== today) {
        user.streakCount = 1; // reset streak if missed a day
      }
      user.lastAdherenceDate = today;
      if (user.streakCount > user.longestStreak) {
        user.longestStreak = user.streakCount;
      }
      await user.save();
    }

    res.json({ message: "Marked as taken", medication: med, streak: user ? user.streakCount : 0 });
  } catch (error) {
    next(error);
  }
});

// ─── Chat ───
/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: AI medical chat assistant
 *     tags: [AI]
 */
router.post("/chat", protect, async (req, res, next) => {
  const { question, medications, age, conditions } = req.body;
  if (!question) return res.status(400).json({ message: "Question required" });

  try {
    const profile = { age, conditions };
    const response = await aiService.generateChatResponse(question, profile, medications || []);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// ─── History ───
router.get("/history", protect, async (req, res, next) => {
  try {
    const history = await GuidanceHistory.find({ user: req.user }).sort({ createdAt: -1 }).limit(20).lean();
    res.json(history);
  } catch (err) {
    next(err);
  }
});

// ─── Results ───
router.get("/results", protect, async (req, res, next) => {
  try {
    const results = await AIReport.find({ userId: req.user }).sort({ createdAt: -1 }).limit(20).lean();
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// ─── Digital Twin Simulation (NEW) ───
/**
 * @swagger
 * /api/ai/simulate-health:
 *   post:
 *     summary: Simulate 24-hr bodily response
 *     tags: [AI]
 */
router.post("/simulate-health", protect, async (req, res, next) => {
  try {
    const { medications } = req.body;
    let medsToSimulate = medications;
    
    // Fall back to DB meds if not provided
    if (!medsToSimulate || !Array.isArray(medsToSimulate) || medsToSimulate.length === 0) {
      medsToSimulate = await Medication.find({ user: req.user, active: true }).lean();
    }

    const profile = await HealthProfile.findOne({ user: req.user }).lean() || {};
    
    // Call AI to get 24-hour prediction array
    const simulationResult = await aiService.simulateHealth(profile, medsToSimulate);
    
    // Save simulation report
    const simulationRecord = await Simulation.create({
      userId: req.user,
      input: { profile, medications: medsToSimulate.map(m => ({ name: m.name, dosage: m.dosage, timeOfIntake: m.timeOfIntake })) },
      hourlyPrediction: simulationResult.hourlyPrediction,
    });
    
    logger.info(`[AI] Digital Twin Simulation completed for user ${req.user}`);
    res.json({ id: simulationRecord._id, ...simulationResult });
  } catch (error) {
    next(error);
  }
});

// ─── Adherence Coach (NEW) ───
/**
 * @swagger
 * /api/ai/adherence-coach:
 *   post:
 *     summary: AI Medication Adherence Coach
 *     tags: [AI]
 */
router.post("/adherence-coach", protect, async (req, res, next) => {
  try {
    const profile = await HealthProfile.findOne({ user: req.user }).lean() || {};
    const user = await User.findById(req.user).lean();
    
    // Get last 7 days of adherence data
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const adherenceRecords = await Adherence.find({
      userId: req.user,
      createdAt: { $gte: weekAgo }
    }).populate("medicationId", "name timeOfIntake frequency").lean();

    const formattedHistory = adherenceRecords.map(r => ({
      date: r.date,
      medication: r.medicationId ? r.medicationId.name : 'Unknown',
      status: r.status,
      delayMinutes: r.delayMinutes
    }));

    const result = await aiService.generateAdherenceCoaching(profile, formattedHistory, user?.streakCount || 0);

    res.json({
      streakCount: user?.streakCount || 0,
      longestStreak: user?.longestStreak || 0,
      coach: result
    });
  } catch (error) {
    next(error);
  }
});

// ─── Medical Report Scanner (NEW) ───
/**
 * @swagger
 * /api/ai/scan-report:
 *   post:
 *     summary: Scan a medical document and extract structured AI data
 *     tags: [AI]
 */
router.post("/scan-report", protect, upload.single("report"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No document provided. Please upload a PDF or image." });
    }

    let rawText = "";
    logger.info(`[AI] Scanning report: ${req.file.originalname} (${req.file.mimetype})`);

    // Step 1: Document Text Extraction
    try {
      if (req.file.mimetype === "application/pdf") {
        const pdfData = await pdfParse(req.file.buffer);
        rawText = pdfData.text;
        
        // If pdf-parse found nothing (scanned PDF), we tell the user
        if (!rawText || rawText.trim().length < 10) {
           logger.warn(`[AI] PDF contains no text (likely scanned image).`);
           // Note: In a real production app, we'd use something like 'pdf-img-convert' here 
           // to process pages through Tesseract. For now, we'll inform the user.
        }
      } else if (req.file.mimetype.startsWith("image/")) {
        const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng');
        rawText = text;
      } else {
        return res.status(400).json({ message: "Unsupported file type. Use PDF or JPG/PNG images." });
      }
    } catch (extractionError) {
      logger.error(`[AI] Extraction failed: ${extractionError.message}`);
      return res.status(500).json({ message: "Failed to extract text from document. Please ensure it's a clear file." });
    }

    if (!rawText || rawText.trim().length < 5) {
      // If we still have no text, we can't do AI analysis, but we can return a "No data found" response or mock
      return res.status(400).json({ message: "Could not read any text from this document. Please upload a clearer version." });
    }

    // Step 2: AI Structural Parsing
    const extractionResult = await aiService.extractReportData(rawText);

    // Step 3: Save to DB
    const report = await MedicalReport.create({
      userId: req.user,
      fileName: req.file.originalname,
      rawText: rawText.substring(0, 5000), // Prevent DB bloat
      extractedData: extractionResult.extractedData,
      aiSummary: extractionResult.aiSummary,
    });

    res.json(report);
  } catch (error) {
    logger.error(`[AI] Scan Report Route Error: ${error.message}`);
    next(error);
  }
});

module.exports = router;
