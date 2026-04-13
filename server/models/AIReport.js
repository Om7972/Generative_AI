const mongoose = require("mongoose");

const aiReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    inputData: { type: mongoose.Schema.Types.Mixed, required: true },
    aiResponse: { type: mongoose.Schema.Types.Mixed, required: true },
    riskScore: { type: String, enum: ["low", "medium", "high", "unknown"], default: "unknown" },
    numericRiskScore: { type: Number, default: 0, min: 0, max: 100 },
    reportType: { type: String, enum: ["full-analysis", "daily-summary", "missed-dose", "chat"], default: "full-analysis" },
  },
  { timestamps: true }
);

aiReportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("AIReport", aiReportSchema);
