const mongoose = require("mongoose");

const healthProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    age: { type: Number, default: null },
    weight: { type: Number, default: null },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    conditions: [{ type: String }],
    allergies: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthProfile", healthProfileSchema);
