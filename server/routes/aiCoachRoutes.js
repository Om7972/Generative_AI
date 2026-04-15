const express = require('express');
const router = express.Router();
const aiCoachService = require('../services/aiCoachService');
const CoachConversation = require('../models/CoachConversation');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// @route   POST /api/ai/coach/chat
// @desc    Get AI coach response
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, mood } = req.body;
    const userId = req.user.id;

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
router.get('/history', auth, async (req, res) => {
  try {
    const conversation = await CoachConversation.findOne({ userId: req.user.id });
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
router.get('/daily-brief', auth, async (req, res) => {
  try {
    const briefing = await aiCoachService.generateDailyBriefing(req.user.id);
    res.json(briefing);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ai/coach/analyze-habits
// @desc    Analyze user habits
router.get('/analyze-habits', auth, async (req, res) => {
  try {
    const habits = await aiCoachService.analyzeHabits(req.user.id);
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
