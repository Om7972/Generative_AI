const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true }, // 'daily', 'weekly', 'custom'
    timeOfIntake: { type: String, required: true },
    active: { type: Boolean, default: true },
    lastTaken: { type: Date, default: null },
    missedCount: { type: Number, default: 0 },
    takenToday: { type: Boolean, default: false },
  },
  { timestamps: true }
);

medicationSchema.index({ user: 1, active: 1 });
medicationSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model("Medication", medicationSchema);
