import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';

const InsightTimeline = ({ steps = [], title = 'AI Insight Timeline' }) => {
  const demoSteps = steps.length > 0 ? steps : [
    { title: 'Medication Review', desc: 'All current prescriptions analyzed', status: 'complete' },
    { title: 'Interaction Check', desc: 'Cross-referencing drug databases', status: 'complete' },
    { title: 'Dosage Analysis', desc: 'Personalized timing optimization', status: 'active' },
    { title: 'Safety Report', desc: 'Final safety score calculation', status: 'pending' },
  ];

  const statusStyles = {
    complete: {
      dot: 'bg-accent-500',
      line: 'bg-accent-300 dark:bg-accent-700',
      icon: CheckCircle2,
      iconColor: 'text-accent-500',
      text: 'text-slate-800 dark:text-white',
      desc: 'text-slate-500 dark:text-slate-400',
    },
    active: {
      dot: 'bg-primary-500 animate-pulse',
      line: 'bg-slate-200 dark:bg-slate-700',
      icon: ArrowRight,
      iconColor: 'text-primary-500',
      text: 'text-primary-700 dark:text-primary-300',
      desc: 'text-primary-600 dark:text-primary-400',
    },
    pending: {
      dot: 'bg-slate-300 dark:bg-slate-600',
      line: 'bg-slate-200 dark:bg-slate-700',
      icon: Clock,
      iconColor: 'text-slate-400',
      text: 'text-slate-500 dark:text-slate-500',
      desc: 'text-slate-400 dark:text-slate-600',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800"
    >
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
        <div className="p-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
          <Clock size={14} />
        </div>
        {title}
      </h3>

      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />

        <div className="space-y-5">
          {demoSteps.map((step, i) => {
            const s = statusStyles[step.status] || statusStyles.pending;
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="relative flex items-start gap-3"
              >
                {/* Dot */}
                <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ${s.dot} border-2 border-white dark:border-slate-900 z-10 shadow-sm`} />

                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={s.iconColor} />
                    <h4 className={`text-sm font-bold ${s.text}`}>{step.title}</h4>
                  </div>
                  <p className={`text-xs font-medium ${s.desc} mt-0.5 ml-5`}>{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default InsightTimeline;
