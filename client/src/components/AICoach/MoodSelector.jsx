import React from 'react';
import { motion } from 'framer-motion';

const moods = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'stressed', emoji: '😰', label: 'Stressed' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
  { id: 'neutral', emoji: '😐', label: 'Neutral' },
  { id: 'sick', emoji: '🤒', label: 'Sick' },
];

const MoodSelector = ({ selectedMood, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {moods.map((mood) => (
        <motion.button
          key={mood.id}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelect(mood.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
            selectedMood === mood.id
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
          }`}
        >
          <span className="text-xl">{mood.emoji}</span>
          <span className="font-medium text-sm">{mood.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default MoodSelector;
