const mongoose = require("mongoose");

const adherenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    medicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Medication", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD format
    status: { type: String, enum: ["taken", "missed", "delayed"], required: true },
    delayMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

adherenceSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Adherence", adherenceSchema);
