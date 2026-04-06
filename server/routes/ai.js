const express = require("express");
const { protect } = require("../middleware/auth");
const { OpenAI } = require("openai");
const GuidanceHistory = require("../models/GuidanceHistory");
const AIResult = require("../models/AIResult");

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ── Helper: safely parse AI JSON ──
function parseAIJson(raw) {
  // strip markdown fences if present
  let cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  return JSON.parse(cleaned);
}

/**
 * @swagger
 * /api/ai/generate-guidance:
 *   post:
 *     summary: Generate clinical guidance profile
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Structured AI guidance
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

    const parsedData = parseAIJson(response.choices[0].message.content);

    const historyEntry = await GuidanceHistory.create({
      user: req.user,
      context: { age, conditions, allergies, medications },
      report: parsedData,
    });

    res.json({ ...parsedData, historyId: historyEntry._id });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/ai/personalized-dosage:
 *   post:
 *     summary: Generate personalized dosage plan based on patient demographics
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: number
 *               weight:
 *                 type: number
 *               gender:
 *                 type: string
 *               conditions:
 *                 type: array
 *               allergies:
 *                 type: array
 *               medications:
 *                 type: array
 *     responses:
 *       200:
 *         description: Personalized dosage plan
 */
router.post("/personalized-dosage", protect, async (req, res, next) => {
  const { age, weight, gender, conditions, allergies, medications } = req.body;

  if (!medications || !Array.isArray(medications) || medications.length === 0) {
    return res.status(400).json({ message: "At least one medication is required." });
  }
  if (!age || !weight) {
    return res.status(400).json({ message: "Age and weight are required for dosage personalization." });
  }

  try {
    const prompt = `
You are an expert clinical pharmacologist AI. Generate a PERSONALIZED dosage plan.

Patient Demographics:
- Age: ${age} years
- Weight: ${weight} kg
- Gender: ${gender || 'Not specified'}
- Existing conditions: ${(conditions && conditions.length) ? conditions.join(', ') : 'None'}
- Known allergies: ${(allergies && allergies.length) ? allergies.join(', ') : 'None'}

Medications to plan:
${medications.map((m, i) => `${i + 1}. ${typeof m === 'string' ? m : m.name}`).join('\n')}

For EACH medication provide:
1. Recommended dosage adjusted for patient weight/age
2. Optimal timing (morning/afternoon/evening/bedtime, with or without food)
3. Specific precautions based on conditions & allergies
4. Important notes

Return STRICTLY valid JSON:
{
  "dosagePlan": [
    {
      "medication": "Drug Name",
      "recommendedDosage": "e.g. 10mg once daily",
      "timing": "e.g. Morning, 30 min before breakfast",
      "precautions": ["precaution 1", "precaution 2"],
      "notes": "additional info"
    }
  ],
  "generalAdvice": "Overall guidance string"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const parsedData = parseAIJson(response.choices[0].message.content);

    // Persist result
    await AIResult.create({
      user: req.user,
      type: "dosage",
      medications: medications.map(m => typeof m === 'string' ? m : m.name),
      dosagePlan: parsedData,
      context: { age, weight, gender, conditions, allergies },
    });

    res.json(parsedData);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/ai/check-interactions:
 *   post:
 *     summary: Analyze drug interactions between multiple medications
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medications:
 *                 type: array
 *               conditions:
 *                 type: array
 *     responses:
 *       200:
 *         description: Interaction analysis results
 */
router.post("/check-interactions", protect, async (req, res, next) => {
  const { medications, conditions, allergies } = req.body;

  if (!medications || !Array.isArray(medications) || medications.length < 2) {
    return res.status(400).json({ message: "At least two medications are required to check interactions." });
  }

  try {
    const medNames = medications.map(m => typeof m === 'string' ? m : m.name);

    const prompt = `
You are a drug interaction analysis AI. Analyze ALL possible interactions between these medications.

Medications: ${medNames.join(', ')}
Patient conditions: ${(conditions && conditions.length) ? conditions.join(', ') : 'None'}
Allergies: ${(allergies && allergies.length) ? allergies.join(', ') : 'None'}

For each interaction found:
1. List the drugs involved
2. Rate severity as exactly one of: "low", "medium", "high"
3. Describe the interaction mechanism
4. Provide a recommendation

Also provide an overall safety summary.

Return STRICTLY valid JSON:
{
  "interactions": [
    {
      "drugs": ["Drug A", "Drug B"],
      "severity": "low | medium | high",
      "description": "Mechanism explanation",
      "recommendation": "What patient should do"
    }
  ],
  "overallRisk": "low | medium | high",
  "summary": "Overall safety assessment string"
}

If no interactions are found, return an empty interactions array with overallRisk "low".
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const parsedData = parseAIJson(response.choices[0].message.content);

    // Persist result
    await AIResult.create({
      user: req.user,
      type: "interaction",
      medications: medNames,
      interactions: parsedData.interactions || [],
      context: { conditions, allergies, overallRisk: parsedData.overallRisk },
    });

    res.json(parsedData);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: AI medical chat assistant
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: AI response
 */
router.post("/chat", protect, async (req, res, next) => {
  const { question, medications, age, conditions } = req.body;
  if (!question) return res.status(400).json({ message: "Question required" });

  try {
    const prompt = `
You are a helpful AI Medical Chat Assistant. A patient is asking a question about their routine.
Patient is ${age || 'unknown age'}, has conditions: ${(conditions || []).join(', ')}.
Medications: ${medications ? medications.map(m => typeof m === 'string' ? m : m.name).join(', ') : 'None provided'}.

Question: "${question}"

Provide a thorough, direct, and safe answer. Keep it strictly under 3 paragraphs.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });
    res.json({ answer: response.choices[0].message.content });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/ai/history:
 *   get:
 *     summary: Get AI guidance history
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: History list
 */
router.get("/history", protect, async (req, res, next) => {
  try {
    const history = await GuidanceHistory.find({ user: req.user }).sort({ createdAt: -1 }).lean();
    res.json(history);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/ai/results:
 *   get:
 *     summary: Get all AI analysis results (dosage + interactions)
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Results list
 */
router.get("/results", protect, async (req, res, next) => {
  try {
    const results = await AIResult.find({ user: req.user }).sort({ createdAt: -1 }).limit(20).lean();
    res.json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
