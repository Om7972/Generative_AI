import React from 'react';
import { motion } from 'framer-motion';
import { Pill, Clock, Edit2, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

const MedicationCard = ({ med, onEdit, onDelete, onMarkTaken, onMissedDose, index = 0 }) => {
  const freqColor = {
    daily: 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800',
    weekly: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
    custom: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.25, type: 'spring', stiffness: 300 } }}
      className="glass-card rounded-2xl p-5 relative group cursor-default card-3d"
      id={`medication-card-${med._id}`}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/[0.02] to-violet-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

      {/* Top row */}
      <div className="flex justify-between items-start mb-4 relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="p-2.5 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/50 dark:to-primary-800/30 rounded-xl text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-700/50 shadow-sm"
            >
              <Pill size={20} />
            </motion.div>
            {/* Status dot with pulse animation */}
            <motion.div
              animate={!med.takenToday ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm ${
                med.takenToday ? 'bg-accent-400' : 'bg-amber-400'
              }`}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[180px]">
              {med.name}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-0.5">
              {med.dosage}
            </p>
          </div>
        </div>

        {/* Actions with scale-in animation */}
        <div className="flex gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-hover:translate-x-0 md:translate-x-2 transition-all duration-300">
          {onMarkTaken && !med.takenToday && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => onMarkTaken(med._id)}
              className="p-1.5 text-slate-400 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Mark as taken"
            >
              <CheckCircle size={14} />
            </motion.button>
          )}
          {onMissedDose && !med.takenToday && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => onMissedDose(med)}
              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Missed dose options"
            >
              <AlertTriangle size={14} />
            </motion.button>
          )}
          {onEdit && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => onEdit(med)}
              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Edit medication"
            >
              <Edit2 size={14} />
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => onDelete(med._id)}
              className="p-1.5 text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Delete medication"
            >
              <Trash2 size={14} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-800/50 relative">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${freqColor[med.frequency] || freqColor.daily}`}>
          <Clock size={12} />
          <span>{med.frequency}</span>
        </div>
        <span className="font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-800 px-3 py-1 rounded-lg text-xs">
          {med.timeOfIntake}
        </span>
      </div>
    </motion.div>
  );
};

export default MedicationCard;
