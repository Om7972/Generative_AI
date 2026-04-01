const express = require("express");
const { protect } = require("../middleware/auth");
const { OpenAI } = require("openai");
const GuidanceHistory = require("../models/GuidanceHistory");

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @swagger
 * /api/ai/generate-guidance:
 *   post:
 *     summary: Generates clinical guidance profile based on provided metrics
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/generate-guidance", protect, async (req, res, next) => {
  const { medications, age, conditions, allergies } = req.body;

  if (!medications || !Array.isArray(medications) || medications.length === 0) {
    return res.status(400).json({ message: "At least one medication is required." });
  }

  try {
    const prompt = `
You are a top-tier medical pharmacology AI. Analyze the patient profile and medications carefully.

Patient Profile:
- Age: ${age || 'Unknown'}
- Medical Conditions: ${(conditions && conditions.length) ? conditions.join(', ') : 'None reported'}
- Allergies: ${(allergies && allergies.length) ? allergies.join(', ') : 'None reported'}

Medications:
${medications.map(m => `- ${m.name} (${m.dosage}, ${m.frequency}, ${m.timeOfIntake})`).join('\n')}

Tasks:
1. Generate dosage reminders in clear natural language.
2. Detect potential drug interactions and explicitly highlight risky combinations.
3. Provide critical safety warnings based on age, conditions, and allergies.
4. Suggest the best intake timing for maximum efficacy.
5. Provide a single "riskLevel" which must be strictly one of these strings: "Low", "Medium", "High".

Output JSON format exactly:
{
  "riskLevel": "Low | Medium | High",
  "reminders": ["...", "..."],
  "interactions": ["...", "..."],
  "warnings": ["...", "..."],
  "tips": ["...", "..."]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2, 
    });

    const aiMessage = response.choices[0].message.content;
    
    let parsedData;
    try {
      parsedData = JSON.parse(aiMessage);
    } catch(err) {
      console.error("AI returned malformed JSON:", aiMessage);
      return res.status(500).json({ message: "Error parsing AI response" });
    }

    // Tracker logic: Store history in MongoDB
    const historyEntry = await GuidanceHistory.create({
      user: req.user,
      context: { age, conditions, allergies, medications },
      report: parsedData
    });

    res.json({ ...parsedData, historyId: historyEntry._id });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Ask the AI a specific medical question based on history
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: AI Response generated
 */
router.post("/chat", protect, async (req, res, next) => {
  const { question, medications, age, conditions } = req.body;
  if(!question) return res.status(400).json({ message: "Question required" });
  
  try {
     const prompt = `
You are a helpful AI Medical Chat Assistant. A patient is asking a question about their routine.
Patient is ${age || 'unknown age'}, has conditions: ${(conditions || []).join(', ')}.
Medications: ${medications ? medications.map(m => m.name).join(', ') : 'None provided'}.

Question: "${question}"

Provide a thorough, direct, and safe answer to this question based on their medications.
Keep it strictly under 3 paragraphs.
     `;
     
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4, 
    });
    res.json({ answer: response.choices[0].message.content });
  } catch(error) {
    res.status(500).json({ message: "Chat API failed" });
  }
});

// GET user histories
/**
 * @swagger
 * /api/ai/history:
 *   get:
 *     summary: Obtain the medical evaluation histories
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/history", protect, async (req, res, next) => {
  try {
     const history = await GuidanceHistory.find({ user: req.user }).sort({ createdAt: -1 }).lean();
     res.json(history);
  } catch(err) {
    next(err);
  }
});

module.exports = router;
