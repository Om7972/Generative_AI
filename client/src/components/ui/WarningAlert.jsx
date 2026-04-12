import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, AlertCircle, X } from 'lucide-react';

const WarningAlert = ({ severity = 'medium', title, message, onDismiss, glow = false, index = 0 }) => {
  const severityMap = {
    low: {
      bg: 'bg-amber-50 dark:bg-amber-900/15',
      border: 'border-amber-200 dark:border-amber-800/50',
      text: 'text-amber-800 dark:text-amber-300',
      subtext: 'text-amber-700 dark:text-amber-400',
      icon: AlertCircle,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    medium: {
      bg: 'bg-orange-50 dark:bg-orange-900/15',
      border: 'border-orange-200 dark:border-orange-800/50',
      text: 'text-orange-800 dark:text-orange-300',
      subtext: 'text-orange-700 dark:text-orange-400',
      icon: AlertTriangle,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    },
    high: {
      bg: 'bg-danger-50 dark:bg-danger-900/15',
      border: 'border-danger-200 dark:border-danger-800/50',
      text: 'text-danger-700 dark:text-danger-300',
      subtext: 'text-danger-600 dark:text-danger-400',
      icon: ShieldAlert,
      iconBg: 'bg-danger-100 dark:bg-danger-900/30',
    },
  };

  const s = severityMap[severity] || severityMap.medium;
  const Icon = s.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 15 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className={`relative rounded-2xl p-4 border ${s.bg} ${s.border} ${glow ? 'glow-warning' : ''}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 ${s.iconBg} rounded-xl flex-shrink-0`}>
          <Icon size={18} className={s.text} />
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`text-sm font-bold ${s.text} mb-1`}>{title}</h4>
          )}
          <p className={`text-[13px] font-medium ${s.subtext} leading-relaxed`}>
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default WarningAlert;
