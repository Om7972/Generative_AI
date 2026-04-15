import React from 'react';
import { motion } from 'framer-motion';

const CoachCard = ({ title, icon: Icon, children, className = "" }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <Icon size={20} />
          </div>
        )}
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
};

export default CoachCard;
