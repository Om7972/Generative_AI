import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, Sparkles, ArrowRight } from 'lucide-react';

const AIInsightCard = ({ title, content, type = 'info', icon: CustomIcon, index = 0, children }) => {
  const typeStyles = {
    info: {
      bg: 'bg-gradient-to-br from-primary-50/80 to-indigo-50/50 dark:from-primary-900/20 dark:to-indigo-900/10',
      border: 'border-primary-200/60 dark:border-primary-800/40',
      iconBg: 'bg-primary-100 dark:bg-primary-900/40',
      iconColor: 'text-primary-600 dark:text-primary-400',
      titleColor: 'text-primary-900 dark:text-primary-300',
    },
    tip: {
      bg: 'bg-gradient-to-br from-amber-50/80 to-yellow-50/50 dark:from-amber-900/15 dark:to-yellow-900/10',
      border: 'border-amber-200/60 dark:border-amber-800/40',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      titleColor: 'text-amber-900 dark:text-amber-300',
    },
    success: {
      bg: 'bg-gradient-to-br from-accent-50/80 to-emerald-50/50 dark:from-accent-900/15 dark:to-emerald-900/10',
      border: 'border-accent-200/60 dark:border-accent-800/40',
      iconBg: 'bg-accent-100 dark:bg-accent-900/40',
      iconColor: 'text-accent-600 dark:text-accent-400',
      titleColor: 'text-accent-900 dark:text-accent-300',
    },
    ai: {
      bg: 'bg-gradient-to-br from-violet-50/80 to-fuchsia-50/50 dark:from-violet-900/15 dark:to-fuchsia-900/10',
      border: 'border-violet-200/60 dark:border-violet-800/40',
      iconBg: 'bg-violet-100 dark:bg-violet-900/40',
      iconColor: 'text-violet-600 dark:text-violet-400',
      titleColor: 'text-violet-900 dark:text-violet-300',
    },
  };

  const s = typeStyles[type] || typeStyles.info;
  const Icon = CustomIcon || (type === 'ai' ? Sparkles : type === 'tip' ? Lightbulb : Brain);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className={`relative overflow-hidden rounded-2xl p-5 border ${s.bg} ${s.border} group cursor-default`}
    >
      {/* Subtle decorative gradient orb */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-primary-400/5 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 ${s.iconBg} rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
            <Icon size={18} className={s.iconColor} />
          </div>
          <h3 className={`text-[15px] font-bold ${s.titleColor} leading-snug pt-0.5`}>
            {title}
          </h3>
        </div>
        {content && (
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium pl-11">
            {content}
          </p>
        )}
        {children && <div className="pl-11 mt-2">{children}</div>}
      </div>
    </motion.div>
  );
};

export default AIInsightCard;
