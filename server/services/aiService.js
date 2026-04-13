const { OpenAI } = require("openai");
const { z } = require("zod");
const logger = require("../utils/logger");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Zod Schemas ───

const fullAnalysisSchema = z.object({
  dosage_plan: z.array(z.object({
    medicine: z.string(),
    recommended_range: z.string(),
    timing: z.string(),
    notes: z.string()
  })),
  interactions: z.array(z.object({
    drugs: z.array(z.string()),
    severity: z.enum(["low", "medium", "high"]),
    issue: z.string(),
    advice: z.string()
  })),
  missed_dose: z.string(),
  warnings: z.array(z.string()),
  lifestyle_tips: z.array(z.string())
});

const riskScoreSchema = z.object({
  score: z.number().min(0).max(100),
  level: z.enum(["safe", "moderate", "high", "critical"]),
  breakdown: z.object({
    interaction_risk: z.number().min(0).max(100),
    condition_risk: z.number().min(0).max(100),
    adherence_risk: z.number().min(0).max(100),
  }),
  explanation: z.string(),
  emergency: z.boolean(),
  emergency_message: z.string().optional(),
});

const missedDoseSchema = z.object({
  action: z.enum(["take_now", "skip", "adjust_next"]),
  reasoning: z.string(),
  adjusted_timing: z.string().optional(),
  warnings: z.array(z.string()),
});

const dailySummarySchema = z.object({
  narrative: z.string(),
  risk_score: z.number().min(0).max(100),
  risk_level: z.enum(["safe", "moderate", "high", "critical"]),
  optimized_schedule: z.array(z.object({
    time_slot: z.string(),
    medications: z.array(z.string()),
    instructions: z.string(),
  })),
  emergency_alerts: z.array(z.object({
    severity: z.enum(["low", "medium", "high", "critical"]),
    title: z.string(),
    message: z.string(),
    action_required: z.boolean(),
  })),
  tips: z.array(z.string()),
});

const combinationOptimizerSchema = z.object({
  optimized_groups: z.array(z.object({
    time_slot: z.string(),
    medications: z.array(z.string()),
    reason: z.string(),
    instructions: z.string(),
  })),
  conflicts_resolved: z.array(z.string()),
  frequency_reduction: z.string(),
  total_daily_slots: z.number(),
});

const healthSimulationSchema = z.object({
  hourlyPrediction: z.array(z.object({
    hour: z.string(),
    energy_level: z.number().min(0).max(100),
    risk_level: z.number().min(0).max(100),
    side_effects: z.array(z.string()),
    notes: z.string(),
  }))
});

const adherenceCoachSchema = z.object({
  message: z.string(),
  insights: z.array(z.string()),
  tips: z.array(z.string()),
  nudge: z.string()
});

const reportScannerSchema = z.object({
  extractedData: z.object({
    medications: z.array(z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      timeOfIntake: z.string().optional(),
      instructions: z.string()
    })),
    doctorNotes: z.string().optional()
  }),
  aiSummary: z.string()
});

// ─── Helpers ───

const isMockMode = () => !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here";

async function callOpenAI(systemPrompt, userPrompt, schema, retries = 3) {
  if (isMockMode()) return null; // caller handles mock

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0].message.content;
      let cleaned = raw.replace(/\s*```json/gi, "").replace(/```\s*$/gi, "").trim();
      const parsed = JSON.parse(cleaned);
      return schema.parse(parsed);
    } catch (error) {
      logger.warn(`AI call attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) throw new Error("AI analysis failed after multiple attempts.");
    }
  }
}

// ─── 1. Full Analysis (existing, enhanced) ───

const FULL_ANALYSIS_SYSTEM = `You are a highly cautious medical assistant AI. You provide safe, general guidance based on standard medical knowledge. You NEVER replace a doctor.
OUTPUT strictly valid JSON matching this schema:
{
  "dosage_plan": [{"medicine":"","recommended_range":"","timing":"","notes":""}],
  "interactions": [{"drugs":["drug1","drug2"],"severity":"low|medium|high","issue":"","advice":""}],
  "missed_dose": "string",
  "warnings": ["warning1"],
  "lifestyle_tips": ["tip1"]
}`;

function buildFullAnalysisPrompt(profile, medications) {
  return `Patient Profile:
Age: ${profile.age || "Unknown"} | Weight: ${profile.weight ? profile.weight + "kg" : "Unknown"} | Gender: ${profile.gender || "Unknown"}
Conditions: ${(profile.conditions || []).join(", ") || "None"}
Allergies: ${(profile.allergies || []).join(", ") || "None"}
Medications: ${medications.map(m => `- ${m.name}`).join("\n") || "None"}

Tasks:
1. Generate personalized dosage guidance (safe ranges only)
2. Identify ALL drug interactions
3. Highlight severe risks clearly
4. Suggest timing (before/after food, morning/evening)
5. Provide missed-dose instructions
6. Give lifestyle tips (hydration, food, habits)
STRICT: Never give exact prescriptions. Always include disclaimers. If risk is high → "Consult a doctor immediately"`;
}

async function generateFullAnalysis(profile, medications, retries = 3) {
  if (isMockMode()) return getMockFullAnalysis(medications);

  const prompt = buildFullAnalysisPrompt(profile, medications);
  const data = await callOpenAI(FULL_ANALYSIS_SYSTEM, prompt, fullAnalysisSchema, retries);

  let riskScore = "low";
  let numericScore = 15;
  if (data.interactions.some(i => i.severity === "high") || data.warnings.length >= 3) {
    riskScore = "high"; numericScore = 78;
  } else if (data.interactions.some(i => i.severity === "medium")) {
    riskScore = "medium"; numericScore = 45;
  }

  return { data, riskScore, numericRiskScore: numericScore };
}

// ─── 2. AI Health Risk Score (NEW) ───

const RISK_SCORE_SYSTEM = `You are a medical risk assessment AI. Calculate a health risk score from 0-100.
OUTPUT strictly valid JSON:
{
  "score": 0-100,
  "level": "safe|moderate|high|critical",
  "breakdown": {"interaction_risk": 0-100, "condition_risk": 0-100, "adherence_risk": 0-100},
  "explanation": "brief explanation",
  "emergency": true/false,
  "emergency_message": "optional urgent message"
}
Scoring rules:
- 0-25 = safe (green)
- 26-50 = moderate (yellow)
- 51-75 = high (orange/red)
- 76-100 = critical (red, emergency)`;

async function calculateRiskScore(profile, medications, missedDoses = 0) {
  if (isMockMode()) return getMockRiskScore(medications, missedDoses);

  const prompt = `Patient: Age ${profile.age || "?"}, Weight ${profile.weight || "?"}kg, Gender ${profile.gender || "?"}
Conditions: ${(profile.conditions || []).join(", ") || "None"}
Allergies: ${(profile.allergies || []).join(", ") || "None"}
Medications: ${medications.map(m => m.name).join(", ")}
Missed doses in last 7 days: ${missedDoses}
Calculate comprehensive risk score considering drug interactions, pre-existing conditions impact, and medication adherence.`;

  return await callOpenAI(RISK_SCORE_SYSTEM, prompt, riskScoreSchema);
}

// ─── 3. Smart Missed Dose Recovery (NEW) ───

const MISSED_DOSE_SYSTEM = `You are a medical missed-dose advisor. Based on the medication, time missed, and patient profile, advise whether to take now, skip, or adjust next dose.
OUTPUT strictly valid JSON:
{
  "action": "take_now|skip|adjust_next",
  "reasoning": "why this action",
  "adjusted_timing": "optional new time if action is adjust_next",
  "warnings": ["any safety warnings"]
}`;

async function getMissedDoseAdvice(medication, hoursLate, profile) {
  if (isMockMode()) return getMockMissedDose(medication, hoursLate);

  const prompt = `Medication: ${medication.name} (${medication.dosage})
Scheduled time: ${medication.timeOfIntake}
Hours overdue: ${hoursLate}
Frequency: ${medication.frequency}
Patient age: ${profile.age || "?"}, Conditions: ${(profile.conditions || []).join(", ") || "None"}
Advise on missed dose recovery.`;

  return await callOpenAI(MISSED_DOSE_SYSTEM, prompt, missedDoseSchema);
}

// ─── 4. Medication Combination Optimizer (NEW) ───

const OPTIMIZER_SYSTEM = `You are a medication schedule optimizer. Group medications into optimal time slots to reduce frequency, minimize conflicts, and improve adherence.
OUTPUT strictly valid JSON:
{
  "optimized_groups": [{"time_slot":"08:00 AM","medications":["Med1","Med2"],"reason":"compatible, both with food","instructions":"Take with breakfast"}],
  "conflicts_resolved": ["moved Med2 away from Med3 due to absorption interference"],
  "frequency_reduction": "Reduced from X to Y daily intake times",
  "total_daily_slots": number
}`;

async function optimizeMedicationSchedule(medications, profile) {
  if (isMockMode()) return getMockOptimizedSchedule(medications);

  const prompt = `Patient: Age ${profile.age || "?"}, Conditions: ${(profile.conditions || []).join(", ") || "None"}
Medications:
${medications.map(m => `- ${m.name} (${m.dosage}, ${m.frequency}, current time: ${m.timeOfIntake})`).join("\n")}
Optimize the schedule to minimize daily intake windows while avoiding conflicts.`;

  return await callOpenAI(OPTIMIZER_SYSTEM, prompt, combinationOptimizerSchema);
}

// ─── 5. AI Daily Health Summary (NEW) ───

const DAILY_SUMMARY_SYSTEM = `You are a daily health summary AI. Generate a concise daily health briefing.
OUTPUT strictly valid JSON:
{
  "narrative": "Today's 2-3 sentence health summary",
  "risk_score": 0-100,
  "risk_level": "safe|moderate|high|critical",
  "optimized_schedule": [{"time_slot":"","medications":[],"instructions":""}],
  "emergency_alerts": [{"severity":"low|medium|high|critical","title":"","message":"","action_required":false}],
  "tips": ["tip1"]
}`;

async function generateDailySummary(profile, medications, missedDoses = 0) {
  if (isMockMode()) return getMockDailySummary(medications, missedDoses);

  const prompt = `Patient: Age ${profile.age || "?"}, Gender ${profile.gender || "?"}, Weight ${profile.weight || "?"}kg
Conditions: ${(profile.conditions || []).join(", ") || "None"}
Allergies: ${(profile.allergies || []).join(", ") || "None"}
Today's medications: ${medications.map(m => `${m.name} (${m.dosage}, ${m.timeOfIntake})`).join(", ")}
Recent missed doses: ${missedDoses}
Generate today's health summary, schedule, and any alerts.`;

  return await callOpenAI(DAILY_SUMMARY_SYSTEM, prompt, dailySummarySchema);
}

// ─── 7. Digital Twin Health Simulation (NEW) ───

const SIMULATION_SYSTEM = `You are a Digital Twin Health Simulator. Predict the patient's bodily response over 24 hours based on their medications, conditions, age, and weight.
OUTPUT strictly valid JSON containing 24 hourly predictions:
{
  "hourlyPrediction": [
    {
      "hour": "00:00",
      "energy_level": 0-100,
      "risk_level": 0-100,
      "side_effects": ["possible effect"],
      "notes": "brief status"
    }
  ]
}
Ensure there are exactly 24 entries, from "00:00" to "23:00". Accurately reflect drug onset, peak times, interactions, and half-lives in energy/risk/side_effects.`;

async function simulateHealth(profile, medications) {
  if (isMockMode()) return getMockSimulation(medications);

  const prompt = `Patient: Age ${profile.age || "?"}, Weight ${profile.weight || "?"}kg, Conditions: ${(profile.conditions || []).join(", ") || "None"}
Medications: ${medications.map(m => `${m.name} (${m.dosage}, taken at ${m.timeOfIntake})`).join(" | ")}
Simulate the 24-hour cycle. Map out energy peaks/crashes, risks, and side effect timelines based on when medications are taken.`;

  return await callOpenAI(SIMULATION_SYSTEM, prompt, healthSimulationSchema);
}

// ─── 8. Adherence Coach (NEW) ───

const ADHERENCE_COACH_SYSTEM = `You are a personalized medication adherence coach. Analyze the user's adherence history and provide behavioral insights, motivation, and practical nudges.
OUTPUT strictly valid JSON:
{
  "message": "Friendly, encouraging chat-like message",
  "insights": ["Observation about their patterns", "E.g., You miss evening doses often"],
  "tips": ["Actionable habit-building tip"],
  "nudge": "Short, smart notification text. E.g., 'Set a wind-down reminder tonight!'"
}`;

async function generateAdherenceCoaching(profile, adherenceHistory, currentStreak) {
  if (isMockMode()) return getMockAdherenceCoaching(currentStreak);

  const prompt = `Patient: ${profile.age || "?"} y/o, Conditions: ${(profile.conditions || []).join(", ") || "None"}.
Current Streak: ${currentStreak} days.
Recent Adherence Records (last 7 days): ${JSON.stringify(adherenceHistory)}
Act as a health coach. Spot any patterns in missed or delayed doses, and offer motivational advice.`;
  
  return await callOpenAI(ADHERENCE_COACH_SYSTEM, prompt, adherenceCoachSchema);
}

// ─── 9. Medical Report Scanner (NEW) ───

const REPORT_SCANNER_SYSTEM = `You are an expert AI medical document analyzer. Extract structural data from OCR text of medical reports/prescriptions.
OUTPUT strictly valid JSON matching the exact schema requirements.
Simplify the explanation for the "aiSummary" so a non-medical user can grasp it perfectly.`;

async function extractReportData(rawText) {
  if (isMockMode()) return getMockReportExtraction();

  const prompt = `Here is the raw OCR text from a medical document:
---
${rawText}
---
Extract all medications, dosages, and instructions clearly. Summarize the report's intent in "aiSummary".`;
  
  return await callOpenAI(REPORT_SCANNER_SYSTEM, prompt, reportScannerSchema);
}

// ─── 6. Chat Response (enhanced) ───

async function generateChatResponse(question, profile, medications) {
  if (isMockMode()) {
    return { answer: "This is a mock response because a valid OpenAI API key is missing. Please set OPENAI_API_KEY in .env." };
  }

  const systemPrompt = `You are a highly cautious medical chat assistant. You provide safe, concise answers based on general medical knowledge. Never diagnose. Keep answers under 3 paragraphs. Include safety disclaimers.`;
  const userPrompt = `Patient: Age ${profile.age || "Unknown"}, Conditions: ${(profile.conditions || []).join(", ") || "None"}
Medications: ${medications.map(m => m.name).join(", ") || "None"}
Question: "${question}"`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
  });

  return { answer: response.choices[0].message.content };
}

// ─── Mock Responses (when no API key) ───

function getMockFullAnalysis(medications) {
  const mockData = {
    dosage_plan: medications.map(m => ({
      medicine: m.name,
      recommended_range: "Standard therapeutic range for " + m.name,
      timing: "Once daily, preferably morning with food",
      notes: "Take with water. Avoid grapefruit juice. (Mock Data)"
    })),
    interactions: medications.length > 1 ? [{
      drugs: [medications[0].name, medications[1]?.name || "Unknown"],
      severity: "medium",
      issue: "Potential CYP3A4 metabolism interaction (Mock)",
      advice: "Monitor for increased side effects. Space doses 2 hours apart."
    }] : [],
    missed_dose: "If you miss a dose, take it as soon as you remember unless it's close to the next scheduled dose. Never double up.",
    warnings: ["This is mock data — no real AI analysis performed.", "Always consult your healthcare provider."],
    lifestyle_tips: ["Stay hydrated — drink 8+ glasses of water daily.", "Avoid alcohol with these medications.", "Exercise 30 min daily to improve circulation."]
  };
  return { data: mockData, riskScore: "medium", numericRiskScore: 42 };
}

function getMockRiskScore(medications, missedDoses) {
  const baseScore = Math.min(100, 15 + medications.length * 12 + missedDoses * 8);
  const level = baseScore <= 25 ? "safe" : baseScore <= 50 ? "moderate" : baseScore <= 75 ? "high" : "critical";
  return {
    score: baseScore,
    level,
    breakdown: {
      interaction_risk: Math.min(100, medications.length * 15),
      condition_risk: 20,
      adherence_risk: Math.min(100, missedDoses * 20),
    },
    explanation: `Risk calculated from ${medications.length} active medications and ${missedDoses} recent missed doses. (Mock Data)`,
    emergency: baseScore > 75,
    emergency_message: baseScore > 75 ? "⚠️ Critical risk detected. Please contact your healthcare provider immediately." : undefined,
  };
}

function getMockMissedDose(medication, hoursLate) {
  if (hoursLate <= 4) {
    return { action: "take_now", reasoning: `Only ${hoursLate}h late. Safe to take ${medication.name} now.`, warnings: ["Monitor for any unusual side effects."] };
  } else if (hoursLate <= 8) {
    return { action: "adjust_next", reasoning: `${hoursLate}h late. Best to adjust the next scheduled dose timing.`, adjusted_timing: "Take next dose 2 hours later than usual", warnings: ["Don't double the dose."] };
  }
  return { action: "skip", reasoning: `Over ${hoursLate}h late. Skip this dose and resume normal schedule.`, warnings: ["Do not double the next dose.", "If symptoms worsen, contact your doctor."] };
}

function getMockOptimizedSchedule(medications) {
  const morningMeds = medications.filter((_, i) => i % 2 === 0).map(m => m.name);
  const eveningMeds = medications.filter((_, i) => i % 2 === 1).map(m => m.name);
  return {
    optimized_groups: [
      ...(morningMeds.length ? [{ time_slot: "08:00 AM", medications: morningMeds, reason: "Compatible medications grouped with breakfast", instructions: "Take all together with food and water" }] : []),
      ...(eveningMeds.length ? [{ time_slot: "08:00 PM", medications: eveningMeds, reason: "Evening medications grouped for sleep benefit", instructions: "Take with light dinner" }] : []),
    ],
    conflicts_resolved: medications.length > 2 ? ["Separated potential interaction pairs into AM/PM slots"] : [],
    frequency_reduction: `Consolidated from ${medications.length} individual times to ${morningMeds.length > 0 && eveningMeds.length > 0 ? 2 : 1} daily slot(s)`,
    total_daily_slots: (morningMeds.length > 0 ? 1 : 0) + (eveningMeds.length > 0 ? 1 : 0),
  };
}

function getMockDailySummary(medications, missedDoses) {
  const riskScore = Math.min(100, 15 + medications.length * 10 + missedDoses * 8);
  const level = riskScore <= 25 ? "safe" : riskScore <= 50 ? "moderate" : riskScore <= 75 ? "high" : "critical";
  return {
    narrative: `Today you have ${medications.length} active medication(s). ${missedDoses > 0 ? `You've missed ${missedDoses} dose(s) recently — please stay on track.` : "Great adherence so far!"} Your overall risk is ${level}. Remember to take medications with food when indicated. (Mock Data)`,
    risk_score: riskScore,
    risk_level: level,
    optimized_schedule: medications.map((m, i) => ({
      time_slot: m.timeOfIntake || (i % 2 === 0 ? "08:00 AM" : "08:00 PM"),
      medications: [m.name],
      instructions: `Take ${m.dosage} with water`,
    })),
    emergency_alerts: riskScore > 75 ? [{
      severity: "critical",
      title: "High Risk Detected",
      message: "Multiple interaction risks found. Contact your healthcare provider.",
      action_required: true,
    }] : [],
    tips: ["Drink at least 8 glasses of water.", "Avoid alcohol with your current medications.", "Get 7-8 hours of sleep."],
  };
}

function getMockSimulation(medications) {
  const hourlyPrediction = [];
  for (let i = 0; i < 24; i++) {
    const hourStr = i.toString().padStart(2, "0") + ":00";
    // Simulate some simple waves for mock data
    const energy = Math.floor(60 + 20 * Math.sin(i / 12 * Math.PI) - (medications.length * 2));
    const risk = Math.floor(10 + medications.length * 5 + 10 * Math.cos(i / 12 * Math.PI));
    hourlyPrediction.push({
      hour: hourStr,
      energy_level: Math.max(0, Math.min(100, energy)),
      risk_level: Math.max(0, Math.min(100, risk)),
      side_effects: medications.length > 0 && i % 8 === 0 ? ["Mild fatigue (mock)"] : [],
      notes: "Steady state",
    });
  }
  return { hourlyPrediction };
}

function getMockAdherenceCoaching(currentStreak) {
  return {
    message: currentStreak > 3 
      ? `You're on fire! 🔥 A ${currentStreak}-day streak is amazing. Keep up the great momentum.`
      : `Let's get back on track! Remember, every pill counts towards your long-term health.`,
    insights: ["You tend to take morning doses on time, but evenings are tricky.", "Weekend adherence is slightly lower."],
    tips: ["Pair your evening medication with brushing your teeth.", "Keep a water bottle near your bed."],
    nudge: "Try setting a 9 PM wind-down alarm tonight!"
  };
}

function getMockReportExtraction() {
  return {
    extractedData: {
      medications: [
        {
          name: "Amoxicillin",
          dosage: "500mg",
          frequency: "3 times a day",
          timeOfIntake: "08:00 AM",
          instructions: "Take with food for 7 days"
        },
        {
          name: "Loratadine",
          dosage: "10mg",
          frequency: "daily",
          timeOfIntake: "09:00 AM",
          instructions: "Take for seasonal allergies"
        }
      ],
      doctorNotes: "Patient presents with mild respiratory infection. Advised rest and hydration."
    },
    aiSummary: "The doctor prescribed Amoxicillin (an antibiotic) for an infection and Loratadine for your allergies. Remember to take the antibiotic with food and finish the entire 7-day course!"
  };
}

module.exports = {
  generateFullAnalysis,
  generateChatResponse,
  calculateRiskScore,
  getMissedDoseAdvice,
  optimizeMedicationSchedule,
  generateDailySummary,
  simulateHealth,
  generateAdherenceCoaching,
  extractReportData,
};
