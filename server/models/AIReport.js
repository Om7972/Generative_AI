const mongoose = require("mongoose");

const aiReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    inputData: { type: mongoose.Schema.Types.Mixed, required: true },
    aiResponse: { type: mongoose.Schema.Types.Mixed, required: true },
    riskScore: { type: String, enum: ["low", "medium", "high", "unknown"], default: "unknown" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIReport", aiReportSchema);
