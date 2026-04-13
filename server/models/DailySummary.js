const mongoose = require("mongoose");

const dailySummarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD format
    summary: {
      totalMedications: { type: Number, default: 0 },
      medicationNames: [{ type: String }],
      riskScore: { type: Number, default: 0, min: 0, max: 100 },
      riskLevel: { type: String, enum: ["safe", "moderate", "high", "critical"], default: "safe" },
      interactionsFound: { type: Number, default: 0 },
      missedDoses: { type: Number, default: 0 },
      adherenceRate: { type: Number, default: 100 },
      aiNarrative: { type: String, default: "" }, // AI-generated summary text
      optimizedSchedule: [
        {
          timeSlot: String,        // e.g. "08:00 AM"
          medications: [String],   // grouped meds
          instructions: String,
        },
      ],
      tips: [{ type: String }],
    },
    alerts: [
      {
        type: { type: String, enum: ["interaction", "missed_dose", "emergency", "info"], default: "info" },
        severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "low" },
        title: { type: String },
        message: { type: String },
        actionRequired: { type: Boolean, default: false },
        resolved: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Compound index: one summary per user per day
dailySummarySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailySummary", dailySummarySchema);
