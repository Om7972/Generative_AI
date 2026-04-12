import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Pill, AlertTriangle, CheckCircle, Zap, Clock, Shield, ChevronRight, Loader2, Info, Activity, HeartPulse, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  RiskScoreMeter,
  AIInsightCard,
  WarningAlert,
  ShimmerSkeleton,
  AdherenceChart,
  RiskHeatmap,
} from '../components/ui';

// ─── Reusable Sub-Components ───

const RiskBadge = ({ severity }) => {
  const map = {
    low: 'bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-900/30 dark:text-accent-300 dark:border-accent-800',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    high: 'bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-900/30 dark:text-danger-300 dark:border-danger-800',
  };
  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${map[severity] || map.low}`}>
      {severity?.charAt(0).toUpperCase() + severity?.slice(1)} Risk
    </span>
  );
};

const DosageCard = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 text-primary-600 dark:text-primary-400 rounded-xl shadow-sm">
          <Pill size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{item.medicine}</h3>
          <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">{item.recommended_range}</p>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2 mb-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
      <Clock size={12} className="text-primary-500" />
      <span>{item.timing}</span>
    </div>
    {item.notes && (
      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 font-medium">{item.notes}</p>
    )}
  </motion.div>
);

const InteractionAlert = ({ item, index }) => {
  const severityColors = {
    low: { bg: 'bg-accent-50 dark:bg-accent-900/15', border: 'border-accent-200 dark:border-accent-800/50', text: 'text-accent-800 dark:text-accent-300', icon: CheckCircle },
    medium: { bg: 'bg-amber-50 dark:bg-amber-900/15', border: 'border-amber-200 dark:border-amber-800/50', text: 'text-amber-800 dark:text-amber-300', icon: AlertTriangle },
    high: { bg: 'bg-danger-50 dark:bg-danger-900/15', border: 'border-danger-200 dark:border-danger-800/50', text: 'text-danger-800 dark:text-danger-300', icon: Shield },
  };
  const c = severityColors[item.severity] || severityColors.low;
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`${c.bg} ${c.border} border rounded-2xl p-4`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${c.bg}`}><Icon size={18} className={c.text} /></div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {item.drugs?.map((d, i) => (
              <span key={i} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700">{d}</span>
            ))}
            <RiskBadge severity={item.severity} />
          </div>
          <p className={`text-xs font-semibold ${c.text} mb-2`}>{item.issue}</p>
          <div className="flex items-start gap-2 bg-white/60 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
            <ChevronRight size={12} className="text-primary-500 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">{item.advice}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Page ───

const HealthInsights = () => {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [healthProfile, setHealthProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Results
  const [analysis, setAnalysis] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [errorLine, setErrorLine] = useState('');

  const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

  useEffect(() => {
    const init = async () => {
      try {
        const [medRes, profileRes] = await Promise.all([
          api.get('/medications'),
          api.get('/profile'),
        ]);
        setMedications(medRes.data);
        setHealthProfile(profileRes.data.healthProfile);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const generateFullAnalysis = async () => {
    if (!healthProfile?.age || !healthProfile?.weight) {
      toast.error('Complete your health profile first (age & weight required).');
      return setErrorLine('Complete your health profile first (age & weight required). Go to Profile page.');
    }
    if (medications.length === 0) {
      toast.error('Add at least one medication first.');
      return setErrorLine('Add at least one medication from the Dashboard first.');
    }
    setGenerating(true);
    setErrorLine('');
    setAnalysis(null);
    try {
      const { data } = await api.post('/ai/full-analysis', {
        age: healthProfile.age,
        weight: healthProfile.weight,
        gender: healthProfile.gender,
        conditions: healthProfile.conditions,
        allergies: healthProfile.allergies,
        medications: medications.map(m => ({ name: m.name })),
      });
      setAnalysis(data);
      toast.success('AI analysis complete');
    } catch (err) {
      setErrorLine(err.response?.data?.message || 'Failed to generate comprehensive AI guidance.');
      toast.error('Analysis failed');
    } finally { setGenerating(false); }
  };

  if (loading) return (
    <div className="py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl shimmer-bg" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg shimmer-bg" />
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg shimmer-bg" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><ShimmerSkeleton variant="card" count={4} /></div>
    </div>
  );

  return (
    <div className="py-6 animate-fade-in text-slate-900 dark:text-slate-100" id="health-insights-page">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <div className="p-2.5 bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900/40 dark:to-violet-800/20 rounded-2xl text-violet-600 dark:text-violet-400 shadow-sm border border-violet-200/50 dark:border-violet-800/50">
            <Brain size={28} />
          </div>
          <span>
            AI Health <span className="font-light">Insights</span>
          </span>
        </motion.h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm">Comprehensive AI-powered analysis of your daily regimen.</p>
      </div>

      {/* Disclaimer */}
      <div className="mb-8 px-5 py-3.5 bg-amber-50 dark:bg-amber-900/15 rounded-xl border border-amber-200/50 dark:border-amber-800/30 flex items-start gap-3">
        <Info size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">AI-generated guidance is not a substitute for professional medical advice. Always consult your healthcare provider.</p>
      </div>

      {/* Profile + Meds Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Your Profile</h3>
          {healthProfile?.age ? (
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Age</span><p className="font-black text-lg">{healthProfile.age}</p></div>
              <div><span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Weight</span><p className="font-black text-lg">{healthProfile.weight || '—'}<span className="text-xs text-slate-400 font-medium"> kg</span></p></div>
              <div><span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Gender</span><p className="font-bold capitalize">{healthProfile.gender || '—'}</p></div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-medium">No health profile set. <a href="/profile" className="text-primary-600 font-bold">Set it up →</a></p>
          )}
        </div>
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Active Medications ({medications.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {medications.length > 0 ? medications.map(m => (
              <span key={m._id} className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-[10px] font-bold border border-primary-200/50 dark:border-primary-800/50">{m.name}</span>
            )) : <p className="text-xs text-slate-500 font-medium">No medications. <a href="/dashboard" className="text-primary-600 font-bold">Add some →</a></p>}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-10 flex justify-start">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={generateFullAnalysis} disabled={generating}
          className="flex items-center gap-4 px-8 py-5 w-full md:w-auto bg-gradient-to-r from-indigo-600 via-primary-600 to-violet-600 text-white rounded-2xl shadow-xl shadow-primary-500/20 font-bold transition disabled:opacity-60 text-sm"
          id="run-ai-scan-btn"
        >
          {generating ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
          <div className="text-left">
            <div className="text-sm font-bold">Run Comprehensive AI Scan</div>
            <div className="text-[10px] text-indigo-200 font-medium">Dosage • Interactions • Tips</div>
          </div>
        </motion.button>
      </div>

      {/* API Error */}
      {errorLine && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <WarningAlert severity="high" title="Error" message={errorLine} />
        </motion.div>
      )}

      {/* Loading Skeletons */}
      <AnimatePresence>
        {generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Loader2 size={18} className="animate-spin text-primary-500" /> Computing Medical Insights...</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><ShimmerSkeleton variant="card" count={4} /></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {analysis && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

          {/* Overall Risk + Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 flex justify-center md:col-span-1">
              <RiskScoreMeter
                score={analysis.riskScore === 'high' ? 78 : analysis.riskScore === 'medium' ? 45 : 20}
                label="Overall Risk"
                severity={analysis.riskScore}
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between p-5 glass-card rounded-2xl border border-slate-200 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-3">
                  <Shield size={22} className="text-primary-500" />
                  <div>
                    <h3 className="font-bold text-lg">Overall Profile Risk</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase">Based on interactions & warnings</p>
                  </div>
                </div>
                {analysis.riskScore && <RiskBadge severity={analysis.riskScore} />}
              </div>

              {/* Risk Heatmap */}
              <RiskHeatmap interactions={analysis.interactions} />
            </div>
          </div>

          {/* Warnings Section */}
          {analysis.warnings?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-danger-700 dark:text-danger-400 flex items-center gap-2 mb-3 uppercase tracking-wider">
                <AlertTriangle size={16} /> Critical Warnings
              </h3>
              {analysis.warnings.map((w, i) => (
                <WarningAlert key={i} severity="high" message={w} index={i} glow />
              ))}
            </div>
          )}

          {/* Charts */}
          <AdherenceChart medications={medications} title="Medication Adherence Trend" />

          {/* Dosage Plan */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap size={18} className="text-primary-500" /> Optimized Dosage Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.dosage_plan?.map((item, i) => (
                <DosageCard key={i} item={item} index={i} />
              ))}
            </div>
          </div>

          {/* Interactions */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield size={18} className="text-indigo-500" /> Drug Interactions
            </h2>
            {analysis.interactions?.length > 0 ? (
              <div className="space-y-3">
                {analysis.interactions.map((item, i) => (
                  <InteractionAlert key={i} item={item} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 glass-card rounded-2xl">
                <CheckCircle size={40} className="mx-auto text-accent-500 mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">No Interactions Detected</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your current medications appear safe to use together.</p>
              </div>
            )}
          </div>

          {/* Missed Dose & Lifestyle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AIInsightCard
              type="tip"
              title="Missed Dose Plan"
              content={analysis.missed_dose || "If you miss a dose, consult your doctor or pharmacist immediately."}
              icon={Clock}
            />
            <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3 flex items-center gap-2"><HeartPulse size={14} className="text-accent-500"/> Lifestyle Recommendations</h3>
              <ul className="space-y-1.5 list-disc pl-4 text-xs text-slate-600 dark:text-slate-300 font-medium">
                {analysis.lifestyle_tips?.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          </div>

        </motion.section>
      )}
    </div>
  );
};

export default HealthInsights;
