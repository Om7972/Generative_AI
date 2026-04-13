const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileName: { type: String },
    fileUrl: { type: String },
    rawText: { type: String },
    extractedData: {
      medications: [
        {
          name: String,
          dosage: String,
          frequency: String,
          timeOfIntake: String,
          instructions: String,
        }
      ],
      doctorNotes: String,
    },
    aiSummary: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalReport", reportSchema);
