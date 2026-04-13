import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, Award, Target, CheckCircle2, AlertTriangle, MessageSquare, Zap
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StreakCounter = ({ currentStreak, longestStreak }) => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div className="glass-card rounded-2xl p-5 border border-amber-200/50 dark:border-amber-900/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 flex items-center gap-4">
      <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20 text-white">
        <Flame size={28} />
      </div>
      <div>
        <p className="text-sm font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest">Current Streak</p>
        <h3 className="text-3xl font-black text-amber-900 dark:text-amber-400">{currentStreak} <span className="text-lg font-bold">days</span></h3>
      </div>
    </div>
    <div className="glass-card rounded-2xl p-5 border border-indigo-200/50 dark:border-indigo-900/30 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 flex items-center gap-4">
      <div className="p-3 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
        <Award size={28} />
      </div>
      <div>
        <p className="text-sm font-bold text-indigo-700 dark:text-indigo-500 uppercase tracking-widest">Best Streak</p>
        <h3 className="text-3xl font-black text-indigo-900 dark:text-indigo-400">{longestStreak} <span className="text-lg font-bold">days</span></h3>
      </div>
    </div>
  </div>
);

const AIMessageBubble = ({ message }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    className="relative bg-primary-600 text-white p-5 rounded-2xl rounded-tl-sm shadow-xl shadow-primary-500/20 mb-6 max-w-2xl"
  >
    <div className="absolute -left-3 top-0 w-6 h-6 bg-primary-600 rounded-sm transform rotate-45" />
    <div className="flex items-start gap-4 relative z-10">
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl flex-shrink-0">
        🩺
      </div>
      <div>
        <h4 className="font-bold text-primary-100 flex items-center gap-1"><Zap size={14} className="text-amber-300" /> MediCoach AI</h4>
        <p className="font-medium mt-1 leading-relaxed">{message}</p>
      </div>
    </div>
  </motion.div>
);

const HabitInsightsCard = ({ insights, tips, nudge }) => (
  <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
    <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800 dark:text-white">
      <Target size={22} className="text-primary-500" /> Behavioral Insights
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" /> Pattern Detections
        </h4>
        <ul className="space-y-3">
          {insights?.map((insight, i) => (
            <li key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-amber-500 mt-0.5">•</span> {insight}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <CheckCircle2 size={14} className="text-accent-500" /> Coach's Tips
        </h4>
        <ul className="space-y-3">
          {tips?.map((tip, i) => (
            <li key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="text-accent-500 mt-0.5">💡</span> {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>

    {nudge && (
      <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/50 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-lg text-primary-600 dark:text-primary-400">
            <MessageSquare size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">Smart Nudge</p>
            <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{nudge}</p>
          </div>
        </div>
      </div>
    )}
  </div>
);

const HealthCoach = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchCoaching();
  }, []);

  const fetchCoaching = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/ai/adherence-coach', {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setData(response.data);
    } catch(err) {
      toast.error('Could not load coach insights.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">Consulting AI Coach...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
          <span className="text-3xl">🧑‍⚕️</span> Your Health Coach
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Personalized gamification and behavioral analysis of your medication adherence.
        </p>
      </div>

      <StreakCounter 
        currentStreak={data?.streakCount || 0} 
        longestStreak={data?.longestStreak || 0} 
      />

      {data?.coach && (
        <div className="space-y-6">
          <AIMessageBubble message={data.coach.message} />
          <HabitInsightsCard 
            insights={data.coach.insights} 
            tips={data.coach.tips} 
            nudge={data.coach.nudge} 
          />
        </div>
      )}
    </motion.div>
  );
};

export default HealthCoach;
