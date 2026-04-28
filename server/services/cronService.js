const cron = require("node-cron");
const Medication = require("../models/Medication");
const DailySummary = require("../models/DailySummary");
const HealthProfile = require("../models/HealthProfile");
const User = require("../models/User");
const aiService = require("./aiService");
const logger = require("../utils/logger");
const notificationService = require("./notificationService");

/**
 * Reminder Engine — node-cron powered scheduler
 * 
 * Jobs:
 * 1. Every hour — check medication schedules and send reminders
 * 2. Every day at midnight — reset takenToday flags, generate daily summaries
 * 3. Every day at 7AM — auto-generate AI daily health summary
 */

function initCronJobs() {
  // ─── Hourly: Check medication reminders ───
  cron.schedule("0 * * * *", async () => {
    logger.info("[CRON] Running hourly medication reminder check...");
    try {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, "0");
      const currentMinute = now.getMinutes() < 30 ? "00" : "30";
      const timeWindow = `${currentHour}:${currentMinute}`;

      // Find all daily medications whose timeOfIntake is within this window
      const dueMeds = await Medication.find({
        active: true,
        frequency: "daily",
        takenToday: false,
        timeOfIntake: { $regex: new RegExp(`^${currentHour}:`) },
      }).populate("user", "username email notificationPrefs").lean();

      // Group by user
      const userMeds = {};
      for (const med of dueMeds) {
        const userId = med.user._id.toString();
        if (!userMeds[userId]) userMeds[userId] = { user: med.user, meds: [] };
        userMeds[userId].meds.push(med);
      }

      // Send reminders
      for (const { user, meds } of Object.values(userMeds)) {
        const message = `Time to take: ${meds.map(m => m.name).join(", ")}`;
        logger.info(`[CRON] Reminder for ${user.username}: ${message}`);

        if (user.email && user.notificationPrefs?.emailReminders) {
          await notificationService.sendEmail(user.email, "MediGuide Reminder", message);
        }
      }

      logger.info(`[CRON] Processed ${dueMeds.length} medication reminders.`);
    } catch (err) {
      logger.error(`[CRON] Hourly reminder error: ${err.message}`);
    }
  });

  // ─── Daily at midnight: Reset takenToday + track missed doses ───
  cron.schedule("0 0 * * *", async () => {
    logger.info("[CRON] Running midnight reset...");
    try {
      // Mark all un-taken daily meds as missed
      const missedResult = await Medication.updateMany(
        { active: true, frequency: "daily", takenToday: false },
        { $inc: { missedCount: 1 } }
      );
      logger.info(`[CRON] Marked ${missedResult.modifiedCount} medications as missed.`);

      // Reset takenToday for all
      await Medication.updateMany(
        { active: true, frequency: "daily" },
        { takenToday: false }
      );
      logger.info("[CRON] Reset takenToday flags for all daily medications.");
    } catch (err) {
      logger.error(`[CRON] Midnight reset error: ${err.message}`);
    }
  });

  // ─── Daily at 7 AM: Auto-generate daily summaries ───
  cron.schedule("0 7 * * *", async () => {
    logger.info("[CRON] Generating daily health summaries...");
    try {
      const users = await User.find({ "notificationPrefs.dailySummary": true }).lean();

      for (const user of users) {
        try {
          const medications = await Medication.find({ user: user._id, active: true }).lean();
          if (medications.length === 0) continue;

          const profile = await HealthProfile.findOne({ user: user._id }).lean() || {};
          const totalMissed = medications.reduce((s, m) => s + (m.missedCount || 0), 0);

          const aiSummary = await aiService.generateDailySummary(profile, medications, totalMissed);
          const today = new Date().toISOString().split("T")[0];

          await DailySummary.findOneAndUpdate(
            { userId: user._id, date: today },
            {
              userId: user._id,
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
                type: a.severity === "critical" ? "emergency" : "interaction",
                severity: a.severity,
                title: a.title,
                message: a.message,
                actionRequired: a.action_required,
              })),
            },
            { upsert: true, new: true }
          );

          logger.info(`[CRON] Daily summary generated for ${user.username}`);
        } catch (userErr) {
          logger.error(`[CRON] Summary failed for ${user.username}: ${userErr.message}`);
        }
      }
    } catch (err) {
      logger.error(`[CRON] Daily summary cron error: ${err.message}`);
    }
  });

  logger.info("✅ Cron jobs initialized (hourly reminders, midnight reset, daily summary)");
}

module.exports = { initCronJobs };
