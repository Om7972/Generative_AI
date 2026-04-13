const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    medication: { type: mongoose.Schema.Types.ObjectId, ref: "Medication", required: true },
    scheduledTime: { type: String, required: true },  // HH:mm format
    frequency: { type: String, enum: ["daily", "weekly", "custom"], default: "daily" },
    notifyVia: {
      email: { type: Boolean, default: false },
      browser: { type: Boolean, default: true },
    },
    email: { type: String, default: "" },
    lastSent: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reminderSchema.index({ user: 1, active: 1 });

module.exports = mongoose.model("Reminder", reminderSchema);
