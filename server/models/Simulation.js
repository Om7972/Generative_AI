const mongoose = require("mongoose");

const simulationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    input: {
      profile: {
        age: Number,
        weight: Number,
        conditions: [String],
      },
      medications: [
        {
          name: String,
          dosage: String,
          timeOfIntake: String,
        }
      ]
    },
    hourlyPrediction: [
      {
        hour: { type: String }, // e.g., "08:00", "09:00"
        energy_level: { type: Number, min: 0, max: 100 },
        risk_level: { type: Number, min: 0, max: 100 },
        side_effects: [{ type: String }],
        notes: { type: String }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Simulation", simulationSchema);
