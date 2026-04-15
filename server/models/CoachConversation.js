const mongoose = require('mongoose');

const CoachConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [
    {
      role: {
        type: String,
        enum: ['user', 'ai'],
        required: true
      },
      text: {
        type: String,
        required: true
      },
      mood: {
        type: String,
        default: 'neutral'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  lastInteraction: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('CoachConversation', CoachConversationSchema);
