import React from 'react';
import { Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const SummaryView = ({ aiSummary }) => {
  if (!aiSummary) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50 to-primary-50 dark:from-indigo-900/10 dark:to-primary-900/10"
    >
      <h3 className="font-bold flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-400">
        <Sparkles size={20} className="text-amber-500" />
        AI Report Simplified
      </h3>
      <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
        {aiSummary}
      </p>
    </motion.div>
  );
};

export default SummaryView;
