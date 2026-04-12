import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const RiskHeatmap = ({ interactions = [] }) => {
  // Build heatmap from interactions data
  const demoData = interactions.length > 0
    ? interactions.map((item, i) => ({
        label: item.drugs ? item.drugs.join(' × ') : item.issue || `Interaction ${i + 1}`,
        severity: item.severity || 'low',
        detail: item.issue || item.advice || 'No details',
      }))
    : [
        { label: 'Drug A × Drug B', severity: 'high', detail: 'Major CYP3A4 inhibition risk' },
        { label: 'Drug A × Drug C', severity: 'medium', detail: 'Moderate QT prolongation' },
        { label: 'Drug B × Drug C', severity: 'low', detail: 'Minor interaction' },
        { label: 'Drug A × Supplement', severity: 'low', detail: 'Bioavailability concern' },
        { label: 'Drug B × Food', severity: 'medium', detail: 'Absorption modified by meals' },
      ];

  const severityStyles = {
    low: {
      bg: 'bg-accent-100 dark:bg-accent-900/40',
      border: 'border-accent-300 dark:border-accent-700',
      text: 'text-accent-800 dark:text-accent-300',
      glow: 'hover:shadow-accent-500/10',
      bar: 'bg-accent-400',
    },
    medium: {
      bg: 'bg-amber-100 dark:bg-amber-900/40',
      border: 'border-amber-300 dark:border-amber-700',
      text: 'text-amber-800 dark:text-amber-300',
      glow: 'hover:shadow-amber-500/10',
      bar: 'bg-amber-400',
    },
    high: {
      bg: 'bg-danger-100 dark:bg-danger-900/40',
      border: 'border-danger-300 dark:border-danger-700',
      text: 'text-danger-800 dark:text-danger-300',
      glow: 'hover:shadow-danger-500/10',
      bar: 'bg-danger-400',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-danger-50 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400 rounded-xl">
          <Activity size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Risk Heatmap</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Visual severity indication</p>
        </div>
      </div>

      <div className="space-y-2">
        {demoData.map((item, i) => {
          const s = severityStyles[item.severity] || severityStyles.low;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${s.bg} ${s.border} transition-shadow hover:shadow-lg ${s.glow} cursor-default`}
            >
              <div className={`w-1.5 h-8 rounded-full ${s.bar} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${s.text} truncate`}>{item.label}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">{item.detail}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
                {item.severity}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        {['low', 'medium', 'high'].map((sev) => (
          <div key={sev} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${severityStyles[sev].bar}`} />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{sev}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default RiskHeatmap;
