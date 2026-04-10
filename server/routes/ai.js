const express = require("express");
const { protect } = require("../middleware/auth");
const AIReport = require("../models/AIReport");
const GuidanceHistory = require("../models/GuidanceHistory");
const AIResult = require("../models/AIResult");
const aiService = require("../services/aiService");

const router = express.Router();

/**
 * @swagger
 * /api/ai/full-analysis:
 *   post:
 *     summary: Generate highly accurate personalized dosage and interaction guidance
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Structured AI full analysis
 */
router.post("/full-analysis", protect, async (req, res, next) => {
  const { medications, age, weight, gender, conditions, allergies } = req.body;

  if (!medications || !Array.isArray(medications) || medications.length === 0) {
    return res.status(400).json({ message: "At least one medication is required." });
  }

  const profile = { age, weight, gender, conditions, allergies };

  try {
    const { data: aiResponse, riskScore } = await aiService.generateFullAnalysis(profile, medications);

    // Save strictly to AIReport Schema
    const report = await AIReport.create({
      userId: req.user,
      inputData: { profile, medications },
      aiResponse,
      riskScore
    });

    // Also persist for backwards compatibility if needed
    await AIResult.create({
      user: req.user,
      type: "guidance",
      medications: medications.map(m => typeof m === "string" ? m : m.name),
      dosagePlan: aiResponse.dosage_plan,
      interactions: aiResponse.interactions,
      context: profile,
    });

    res.json({ ...aiResponse, _id: report._id, riskScore });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: AI medical chat assistant
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: AI response
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

/**
 * @swagger
 * /api/ai/history:
 *   get:
 *     summary: Get AI guidance history
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: History list
 */
router.get("/history", protect, async (req, res, next) => {
  try {
    const history = await GuidanceHistory.find({ user: req.user }).sort({ createdAt: -1 }).lean();
    res.json(history);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/ai/results:
 *   get:
 *     summary: Get all AI analysis results
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Results list
 */
router.get("/results", protect, async (req, res, next) => {
  try {
    const results = await AIReport.find({ userId: req.user }).sort({ createdAt: -1 }).limit(20).lean();
    res.json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
