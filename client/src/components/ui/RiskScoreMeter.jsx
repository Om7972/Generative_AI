import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RiskScoreMeter = ({ score = 0, maxScore = 100, size = 140, label = 'Risk Score', severity }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(score / maxScore, 1);
  const offset = circumference - percentage * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = () => {
    if (severity === 'low' || percentage <= 0.33) return { stroke: '#22c55e', text: 'text-accent-500', glow: 'rgba(34,197,94,0.25)', label: 'Low' };
    if (severity === 'medium' || percentage <= 0.66) return { stroke: '#f59e0b', text: 'text-amber-500', glow: 'rgba(245,158,11,0.25)', label: 'Medium' };
    return { stroke: '#ef4444', text: 'text-danger-500', glow: 'rgba(239,68,68,0.25)', label: 'High' };
  };

  const color = getColor();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow backdrop */}
        <div
          className="absolute inset-2 rounded-full blur-xl opacity-40 transition-all duration-1000"
          style={{ background: color.glow }}
        />

        <svg className="risk-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background ring */}
          <circle
            className="risk-ring-bg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
          />
          {/* Progress ring */}
          <circle
            className="risk-ring-progress"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={animatedScore === 0 ? circumference : offset}
            stroke={color.stroke}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-3xl font-black ${color.text}`}
            key={score}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            {animatedScore}
          </motion.span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            / {maxScore}
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
          color.label === 'Low' ? 'bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-900/30 dark:text-accent-300 dark:border-accent-800' :
          color.label === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' :
          'bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-900/30 dark:text-danger-300 dark:border-danger-800'
        }`}>
          {color.label} Risk
        </span>
      </div>
    </motion.div>
  );
};

export default RiskScoreMeter;
