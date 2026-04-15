import React from 'react';
import { motion } from 'framer-motion';

const ChatBubble = ({ role, text, timestamp }) => {
  const isAI = role === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div
        className={`max-w-[85%] px-5 py-4 rounded-3xl shadow-lg backdrop-blur-md ${
          isAI
            ? 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none'
            : 'bg-blue-600/90 text-white rounded-tr-none border border-blue-500/50'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
        <div
          className={`text-[10px] mt-2 opacity-50 ${isAI ? 'text-slate-400' : 'text-blue-200'}`}
        >
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
