const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    context: {
      age: Number,
      conditions: [String],
      allergies: [String],
      medications: [Object],
    },
    report: {
      riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Unknown'], default: 'Unknown' },
      reminders: [String],
      interactions: [String],
      warnings: [String],
      tips: [String],
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("GuidanceHistory", historySchema);
