import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Clock, AlertTriangle, TrendingUp, Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const DailySummaryCard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/ai/daily-summary', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch daily summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      safe: { bg: 'from-accent-500 to-emerald-500', text: 'text-accent-500', badge: 'bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-900/30 dark:text-accent-300 dark:border-accent-800' },
      moderate: { bg: 'from-amber-500 to-yellow-500', text: 'text-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' },
      high: { bg: 'from-orange-500 to-red-500', text: 'text-danger-500', badge: 'bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-900/30 dark:text-danger-300 dark:border-danger-800' },
      critical: { bg: 'from-red-600 to-red-700', text: 'text-danger-600', badge: 'bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-900/30 dark:text-danger-300 dark:border-danger-800' },
    };
    return colors[level] || colors.safe;
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl shimmer-bg" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg shimmer-bg" />
            <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg shimmer-bg" />
          </div>
        </div>
        <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl shimmer-bg" />
      </div>
    );
  }

  if (!summary?.summary) return null;

  const s = summary.summary;
  const riskColor = getRiskColor(s.riskLevel);
  const hasAlerts = summary.alerts?.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 ${hasAlerts && s.riskLevel === 'critical' ? 'glow-warning' : ''}`}
    >
      {/* Gradient top bar */}
      <div className={`h-1.5 bg-gradient-to-r ${riskColor.bg}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-800/20 text-amber-600 dark:text-amber-400 rounded-xl shadow-sm">
              <Sun size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Today's Health Summary</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${riskColor.badge}`}>
            {s.riskLevel}
          </span>
        </div>

        {/* AI Narrative */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 mb-4 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={12} className="text-primary-500" />
            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">AI Summary</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {s.aiNarrative}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2.5 bg-primary-50/50 dark:bg-primary-900/15 rounded-xl border border-primary-100 dark:border-primary-900/30">
            <p className="text-xl font-black text-primary-600 dark:text-primary-400">{s.totalMedications}</p>
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Meds</p>
          </div>
          <div className="text-center p-2.5 bg-amber-50/50 dark:bg-amber-900/15 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <p className={`text-xl font-black ${riskColor.text}`}>{s.riskScore}</p>
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Risk</p>
          </div>
          <div className="text-center p-2.5 bg-accent-50/50 dark:bg-accent-900/15 rounded-xl border border-accent-100 dark:border-accent-900/30">
            <p className="text-xl font-black text-accent-600 dark:text-accent-400">{s.adherenceRate}%</p>
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Adherence</p>
          </div>
        </div>

        {/* Emergency Alerts */}
        {hasAlerts && (
          <div className="space-y-2 mb-4">
            {summary.alerts.map((alert, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                alert.severity === 'critical' ? 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800/50' :
                alert.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/15 border-orange-200 dark:border-orange-800/50' :
                'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50'
              }`}>
                <AlertTriangle size={14} className={
                  alert.severity === 'critical' ? 'text-danger-600 dark:text-danger-400' :
                  alert.severity === 'high' ? 'text-orange-600 dark:text-orange-400' :
                  'text-amber-600 dark:text-amber-400'
                } />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{alert.title}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Expandable Schedule + Tips */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"
        >
          {expanded ? 'Show Less' : 'View Schedule & Tips'}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Optimized Schedule */}
              {s.optimizedSchedule?.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={10} /> Optimized Schedule
                  </p>
                  {s.optimizedSchedule.map((slot, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 bg-primary-50/30 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/30">
                      <span className="text-xs font-black text-primary-600 dark:text-primary-400 whitespace-nowrap pt-0.5">{slot.timeSlot}</span>
                      <div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {slot.medications.map((m, j) => (
                            <span key={j} className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md text-[10px] font-bold">{m}</span>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{slot.instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tips */}
              {s.tips?.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className I="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp size={10} /> Daily Tips
                  </p>
                  {s.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <span className="text-accent-500 font-bold">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DailySummaryCard;
