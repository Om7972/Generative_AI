import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 dark:bg-primary-500 text-white rounded-full 
                       shadow-xl shadow-primary-500/30 flex items-center justify-center z-50 
                       hover:bg-primary-700 transition-colors pointer-events-auto"
          >
            <MessageSquare size={24} />
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
            className="fixed bottom-6 right-0 md:right-6 w-full md:w-96 h-[500px] max-h-[85vh] 
                       glass-panel rounded-t-2xl md:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="bg-primary-600 dark:bg-slate-800 text-white px-5 py-4 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-3">
                 <div className="p-1.5 bg-white/20 rounded-lg">
                   <Bot size={20} />
                 </div>
                 <div>
                   <h3 className="font-bold text-[15px] leading-tight flex items-center gap-2">AI Assistant <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span></h3>
                   <span className="text-xs text-primary-100 dark:text-slate-400">Contextual to your meds</span>
                 </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-primary-100 hover:text-white dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                   {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-slate-800 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1"><Bot size={16}/></div>}
                   <div className={`p-3 max-w-[80%] rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                     msg.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-slate-700'
                   }`}>
                     {msg.content}
                   </div>
                   {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0 mt-1"><User size={16}/></div>}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start gap-2">
                   <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-slate-800 flex items-center justify-center text-primary-600 dark:text-primary-400"><Bot size={16}/></div>
                   <div className="p-4 max-w-[80%] rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={loading}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-[14.5px]"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading}
                  className="absolute right-2 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors"
                >
                   {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
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
