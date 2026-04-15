const express = require('express');
const router = express.Router();
const aiCoachService = require('../services/aiCoachService');
const CoachConversation = require('../models/CoachConversation');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

// @route   POST /api/ai/coach/chat
// @desc    Get AI coach response
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, mood } = req.body;
    const userId = req.user;

    // Get AI response
    const aiResponse = await aiCoachService.getCoachChatResponse(userId, message, mood);

    // Find or create conversation
    let conversation = await CoachConversation.findOne({ userId });
    if (!conversation) {
      conversation = new CoachConversation({ userId, messages: [] });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      text: message,
      mood: mood || 'neutral',
      timestamp: new Date()
    });

    // Add AI message
    conversation.messages.push({
      role: 'ai',
      text: aiResponse.message,
      timestamp: new Date()
    });

    conversation.lastInteraction = new Date();
    await conversation.save();

    res.json({
      ...aiResponse,
      conversationId: conversation._id
    });
  } catch (error) {
    logger.error(`AI Coach Chat Error: ${error.message}`);
    res.status(500).json({ message: 'Server error in AI Coach' });
  }
});

// @route   GET /api/ai/coach/history
// @desc    Get chat history
router.get('/history', protect, async (req, res) => {
  try {
    const conversation = await CoachConversation.findOne({ userId: req.user });
    if (!conversation) {
      return res.json({ messages: [] });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ai/coach/daily-brief
// @desc    Get daily briefing
// @route   GET /api/ai/coach/daily-brief
// @desc    Get daily briefing
router.get('/daily-brief', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const DailySummary = require('../models/DailySummary');
    
    let summary = await DailySummary.findOne({ userId: req.user, date: today });
    
    if (summary) {
      return res.json({
        title: "Your Health Today",
        summary: summary.summary.aiNarrative,
        schedule_highlights: summary.summary.optimizedSchedule.map(s => `${s.timeSlot}: ${s.medications.join(', ')}`),
        risks: summary.alerts.map(a => a.message),
        tips: summary.summary.tips
      });
    }

    const briefing = await aiCoachService.generateDailyBriefing(req.user);
    res.json(briefing);
  } catch (error) {
    logger.error(`Daily Brief GET Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ai/coach/daily-brief
router.post('/daily-brief', protect, async (req, res) => {
  try {
    const briefing = await aiCoachService.generateDailyBriefing(req.user);
    res.json(briefing);
  } catch (error) {
    logger.error(`Daily Brief POST Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ai/coach/analyze-habits
router.get('/analyze-habits', protect, async (req, res) => {
  try {
    const habits = await aiCoachService.analyzeHabits(req.user);
    res.json(habits);
  } catch (error) {
    logger.error(`Analyze Habits GET Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ai/coach/analyze-habits
router.post('/analyze-habits', protect, async (req, res) => {
  try {
    const habits = await aiCoachService.analyzeHabits(req.user);
    res.json(habits);
  } catch (error) {
    logger.error(`Analyze Habits POST Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
