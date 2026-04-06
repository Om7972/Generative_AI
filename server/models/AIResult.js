const mongoose = require("mongoose");

const aiResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["dosage", "interaction", "guidance"], required: true },
    medications: [{ type: String }],
    dosagePlan: { type: mongoose.Schema.Types.Mixed, default: null },
    interactions: [{ type: mongoose.Schema.Types.Mixed }],
    context: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

aiResultSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("AIResult", aiResultSchema);
