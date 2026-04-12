import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm your AI health assistant. Ask me anything about your current medications." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Data needed for context
  const [meds, setMeds] = useState([]);

  useEffect(() => {
    if (isOpen && user) {
      axios.get('http://localhost:5000/api/medications', {
        headers: { Authorization: `Bearer ${user.token}` }
      }).then(res => setMeds(res.data)).catch(console.error);
    }
  }, [isOpen, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const payload = {
        question: userMessage,
        medications: meds,
        // Mock profile data for chat context. In real app, fetch from real profile settings.
        age: 35,
        conditions: []
      };

      const { data } = await axios.post('http://localhost:5000/api/ai/chat', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't reach the server right now." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-600 to-indigo-600 text-white rounded-2xl
                       shadow-xl shadow-primary-500/30 flex items-center justify-center z-50
                       hover:shadow-primary-500/50 transition-all pointer-events-auto"
            id="chat-fab"
            aria-label="Open chat assistant"
          >
            <Sparkles size={22} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-0 md:right-6 w-full md:w-96 h-[520px] max-h-[85vh]
                       bg-white dark:bg-slate-900 rounded-t-2xl md:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden
                       border border-slate-200/50 dark:border-slate-800/50"
            id="chat-window"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-500 text-white px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/15 rounded-xl backdrop-blur-sm">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-2">
                    AI Assistant
                    <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse inline-block shadow-sm shadow-accent-400/50" />
                  </h3>
                  <span className="text-[10px] text-primary-100/80 font-medium">Contextual to your medications</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1 border border-primary-200/50 dark:border-primary-700/50">
                      <Bot size={14} />
                    </div>
                  )}
                  <div className={`p-3 max-w-[80%] rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-tr-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-slate-700'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0 mt-1">
                      <User size={14} />
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-700/50">
                    <Bot size={14} />
                  </div>
                  <div className="p-3.5 max-w-[80%] rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={loading}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all text-sm font-medium"
                  id="chat-input"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 p-2 bg-gradient-to-br from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-lg disabled:opacity-50 transition-all shadow-sm"
                  id="chat-send-btn"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatAssistant;
