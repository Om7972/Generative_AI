const { OpenAI } = require("openai");
const { z } = require("zod");
const logger = require("../utils/logger");
const CoachConversation = require("../models/CoachConversation");
const Medication = require("../models/Medication");
const HealthProfile = require("../models/HealthProfile");
const Adherence = require("../models/Adherence");
const User = require("../models/User");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy" });
const groqClient = new OpenAI({ 
  baseURL: "https://api.groq.com/openai/v1", 
  apiKey: process.env.GROQ_API_KEY || "dummy" 
});

const coachResponseSchema = z.object({
  message: z.any().transform(v => typeof v === 'string' ? v : (v?.message || JSON.stringify(v))),
  tips: z.array(z.any()).transform(arr => arr.map(a => typeof a === 'string' ? a : JSON.stringify(a))),
  warnings: z.array(z.any()).transform(arr => arr.map(a => typeof a === 'string' ? a : JSON.stringify(a))),
  motivation: z.any().transform(v => typeof v === 'string' ? v : (v?.motivation || JSON.stringify(v))),
});

const isMockMode = () => 
  (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") && 
  (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here");

async function callChatAI(systemPrompt, userPrompt, schema) {
  if (isMockMode()) return null;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return schema.parse(parsed);
  } catch (error) {
    logger.warn(`AI Coach OpenAI failed: ${error.message}. Trying Groq...`);
    try {
      const groqResponse = await groqClient.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(groqResponse.choices[0].message.content);
      return schema.parse(parsed);
    } catch (groqError) {
      logger.error(`AI Coach Groq failed: ${groqError.message}`);
      throw groqError;
    }
  }
}

async function getCoachChatResponse(userId, userMessage, mood = 'neutral') {
  const profile = await HealthProfile.findOne({ user: userId });
  const medications = await Medication.find({ user: userId });
  const adherence = await Adherence.find({ userId }).sort({ date: -1 }).limit(10);
  const currentTime = new Date().toLocaleTimeString();
  const totalMissed = medications.reduce((sum, m) => sum + (m.missedCount || 0), 0);

  const systemPrompt = `You are a friendly, supportive AI Health Coach.
  
  Current Context:
  - Local Time: ${currentTime}
  - User Mood: ${mood}
  - Profile: ${JSON.stringify(profile)}
  - Active Medications: ${medications.length}
  - Adherence Data: ${JSON.stringify(adherence)}
  - Total Missed Doses (Lifetime): ${totalMissed}
  
  Meds Detail: ${JSON.stringify(medications.map(m => ({ name: m.name, time: m.timeOfIntake, missed: m.missedCount })))}

  Tasks:
  1. Give personalized advice based on the user's message and their health context.
  2. Motivate user to follow their medication schedule.
  3. Explain any health risks simply.
  4. Suggest improvements in daily habits.
  5. Adjust your tone based on the user's mood:
     - supportive if stressed
     - motivating if tired/lazy
     - informative if neutral
     - cheerful if happy

  Rules:
  - Never give strict medical prescriptions.
  - Always include a safe disclaimer if medical advice is sought.
  - Keep tone human, caring, and concise.

  Output strictly valid JSON:
  {
    "message": "your main response text",
    "tips": ["tip1", "tip2"],
    "warnings": ["warning1"],
    "motivation": "one-line motivational quote or encouragement"
  }`;

  if (isMockMode()) {
    return {
      message: `[MOCK] Hey there! As your Health Coach, I'm here to support you. Since you're feeling ${mood}, I want to remind you that staying consistent with your ${medications.length} medications is key to feeling your best.`,
      tips: ["Stay hydrated", "Take a short walk"],
      warnings: ["Don't skip your evening dose"],
      motivation: "Small steps lead to big changes!"
    };
  }

  return await callChatAI(systemPrompt, userMessage, coachResponseSchema);
}

async function generateDailyBriefing(userId) {
  const profile = await HealthProfile.findOne({ user: userId });
  const medications = await Medication.find({ user: userId });
  const adherence = await Adherence.find({ userId }).sort({ date: -1 }).limit(5);
  const totalMissed = medications.reduce((sum, m) => sum + (m.missedCount || 0), 0);
  const currentTime = new Date().toLocaleTimeString();

  const systemPrompt = `You are an AI Health Coach. Generate a "Your Health Today" briefing.
  
  Context:
  - Local Time: ${currentTime}
  - Profile: ${JSON.stringify(profile)}
  - Active Meds: ${medications.length}
  - Recent Adherence: ${JSON.stringify(adherence)}
  - Missed Doses: ${totalMissed}

  Output strictly valid JSON:
  {
    "title": "Your Health Today",
    "summary": "2-3 sentences overview",
    "schedule_highlights": ["Med A at 8am", "Med B at 9pm"],
    "risks": ["Possible interaction risk"],
    "tips": ["Lifestyle tip for today"]
  }`;

  if (isMockMode()) {
    return {
      title: "Your Health Today",
      summary: "You have a busy day ahead. Staying on top of your meds will keep your energy levels stable.",
      schedule_highlights: medications.map(m => `${m.name} at ${m.timeOfIntake || 'scheduled time'}`),
      risks: ["Minor fatigue possible if doses are missed"],
      tips: ["Drink 2L of water today"]
    };
  }

  const briefSchema = z.object({
    title: z.any().transform(v => typeof v === 'string' ? v : (v?.title || JSON.stringify(v))),
    summary: z.any().transform(v => typeof v === 'string' ? v : (v?.summary || JSON.stringify(v))),
    schedule_highlights: z.array(z.any()).transform(arr => arr.map(a => typeof a === 'string' ? a : JSON.stringify(a))),
    risks: z.array(z.any()).transform(arr => arr.map(a => typeof a === 'string' ? a : JSON.stringify(a))),
    tips: z.array(z.any()).transform(arr => arr.map(a => typeof a === 'string' ? a : JSON.stringify(a))),
  });

  const parsed = await callChatAI(systemPrompt, "Generate my daily health briefing.", briefSchema);

  // Save to DailySummary for persistence
  try {
    const DailySummary = require('../models/DailySummary');
    const today = new Date().toISOString().split("T")[0];
    
    await DailySummary.findOneAndUpdate(
      { userId, date: today },
      {
        summary: {
          totalMedications: medications.length,
          medicationNames: medications.map(m => m.name),
          aiNarrative: parsed.summary,
          optimizedSchedule: parsed.schedule_highlights.map(s => {
            const parts = s.split(':');
            return {
              timeSlot: parts[0] || "Scheduled",
              medications: [parts[1] || s],
              instructions: "Follow strictly"
            };
          }),
          tips: parsed.tips
        },
        alerts: parsed.risks.map(r => ({
          type: "info",
          severity: "low",
          message: r
        }))
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    logger.error('Failed to save DailySummary from Coach Service:', err);
  }

  return parsed;
}

async function analyzeHabits(userId) {
  const adherence = await Adherence.find({ userId }).sort({ date: -1 }).limit(30);
  const user = await User.findById(userId);

  const systemPrompt = `You are an AI Health Coach. Analyze the user's past 30 days of adherence and identify patterns.
  
  Adherence Data: ${JSON.stringify(adherence)}
  Current Streak: ${user?.streakCount || 0} days
  Longest Streak: ${user?.longestStreak || 0} days

  Output strictly valid JSON:
  {
    "insights": ["e.g., You often miss evening meds"],
    "improvement_plan": "A plan to help them improve",
    "streak_info": "Encouragement about their consistency",
    "streakCount": ${Number(user?.streakCount || 0)},
    "longestStreak": ${Number(user?.longestStreak || 0)}
  }`;

  if (isMockMode()) {
    return {
      insights: ["You're very consistent with morning doses!", "Evening doses are sometimes 1-2 hours late."],
      improvement_plan: "Try setting an alarm for 8 PM to ensure you don't miss your evening medication.",
      streak_info: `You're doing great with a ${user?.streakCount || 0}-day streak! Keep it up.`,
      streakCount: user?.streakCount || 0,
      longestStreak: user?.longestStreak || 0
    };
  }

  const habitSchema = z.object({
    insights: z.array(z.any()).transform(arr => arr.map(a => typeof a === 'string' ? a : JSON.stringify(a))),
    improvement_plan: z.any().transform(v => typeof v === 'string' ? v : (v?.message || v?.plan || JSON.stringify(v) || "Keep up the good work!")),
    streak_info: z.any().transform(v => typeof v === 'string' ? v : (v?.message || v?.info || JSON.stringify(v) || "Consistency is key.")),
    streakCount: z.coerce.number().catch(user?.streakCount || 0),
    longestStreak: z.coerce.number().catch(user?.longestStreak || 0),
  });

  return await callChatAI(systemPrompt, "Analyze my health habits.", habitSchema);
}

module.exports = {
  getCoachChatResponse,
  generateDailyBriefing,
  analyzeHabits
};
