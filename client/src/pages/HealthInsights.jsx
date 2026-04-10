import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Pill, AlertTriangle, CheckCircle, Zap, Clock, Shield, ChevronRight, Loader2, Info, Activity } from 'lucide-react';

// ─── Reusable Components ───

const RiskBadge = ({ severity }) => {
  const map = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
    high: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${map[severity] || map.low}`}>
      {severity?.charAt(0).toUpperCase() + severity?.slice(1)} Risk
    </span>
  );
};

const DosageCard = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-xl">
          <Pill size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{item.medicine}</h3>
          <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold">{item.recommended_range}</p>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2 mb-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
      <Clock size={14} className="text-indigo-500" />
      <span>{item.timing}</span>
    </div>
    {item.notes && (
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 font-medium">{item.notes}</p>
    )}
  </motion.div>
);

const InteractionAlert = ({ item, index }) => {
  const severityColors = {
    low: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/50', text: 'text-emerald-800 dark:text-emerald-300', icon: CheckCircle },
    medium: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/50', text: 'text-amber-800 dark:text-amber-300', icon: AlertTriangle },
    high: { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800/50', text: 'text-rose-800 dark:text-rose-300', icon: Shield },
  };
  const c = severityColors[item.severity] || severityColors.low;
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`${c.bg} ${c.border} border rounded-2xl p-5`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${c.bg}`}><Icon size={20} className={c.text} /></div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {item.drugs?.map((d, i) => (
              <span key={i} className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700">{d}</span>
            ))}
            <RiskBadge severity={item.severity} />
          </div>
          <p className={`text-sm font-semibold ${c.text} mb-2`}>{item.issue}</p>
          <div className="flex items-start gap-2 bg-white/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <ChevronRight size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.advice}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="glass-card rounded-2xl p-5 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      <div className="space-y-2 flex-1"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" /><div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" /></div>
    </div>
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
  </div>
);

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
    if (!healthProfile?.age || !healthProfile?.weight) return setErrorLine('Complete your health profile first (age & weight required). Go to Profile page.');
    if (medications.length === 0) return setErrorLine('Add at least one medication from the Dashboard first.');
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
    } catch (err) {
      setErrorLine(err.response?.data?.message || 'Failed to generate comprehensive AI guidance.');
    } finally { setGenerating(false); }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="py-8 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Brain className="text-primary-600 dark:text-primary-400" size={32} /> AI Health <span className="font-light">Insights</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Comprehensive AI-powered analysis of your daily regimen.</p>
      </div>

      {/* Disclaimer */}
      <div className="mb-8 px-5 py-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40 flex items-start gap-3">
        <Info size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-400 font-semibold">AI-generated guidance is not a substitute for professional medical advice. Always consult your healthcare provider.</p>
      </div>

      {/* Profile + Meds Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Your Profile</h3>
          {healthProfile?.age ? (
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><span className="text-slate-500 text-xs">Age</span><p className="font-bold">{healthProfile.age}</p></div>
              <div><span className="text-slate-500 text-xs">Weight</span><p className="font-bold">{healthProfile.weight || '—'} kg</p></div>
              <div><span className="text-slate-500 text-xs">Gender</span><p className="font-bold capitalize">{healthProfile.gender || '—'}</p></div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 font-medium">No health profile set. <a href="/profile" className="text-primary-600 font-bold underline">Set it up →</a></p>
          )}
        </div>
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Active Medications ({medications.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {medications.length > 0 ? medications.map(m => (
              <span key={m._id} className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-bold border border-primary-200 dark:border-primary-800">{m.name}</span>
            )) : <p className="text-sm text-slate-500 font-medium">No medications. <a href="/dashboard" className="text-primary-600 font-bold underline">Add some →</a></p>}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-10 flex justify-start">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={generateFullAnalysis} disabled={generating}
          className="flex items-center gap-4 px-8 py-5 w-full md:w-auto bg-gradient-to-r from-indigo-600 to-primary-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20 font-bold transition disabled:opacity-60">
          {generating ? <Loader2 size={24} className="animate-spin" /> : <Activity size={24} />}
          <div className="text-left">
            <div className="text-base">Run Comprehensive AI Scan</div>
            <div className="text-xs text-indigo-100 font-normal">Dosage • Interactions • Tips</div>
          </div>
        </motion.button>
      </div>

      {/* API Error */}
      {errorLine && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <AlertTriangle size={18} /> <span className="font-semibold text-sm">{errorLine}</span>
        </motion.div>
      )}

      {/* Loading Skeletons */}
      <AnimatePresence>
        {generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Loader2 size={20} className="animate-spin text-primary-500" /> Computing Medical Insights...</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {analysis && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
          
          {/* Top Info Banner - Overall Risk */}
          <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-primary-500" />
              <div>
                <h3 className="font-bold text-lg">Overall Profile Risk</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">Based on interactions & warnings</p>
              </div>
            </div>
            {analysis.riskScore && <RiskBadge severity={analysis.riskScore} />}
          </div>

          {/* Warnings Section (if any) */}
          {analysis.warnings?.length > 0 && (
             <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/50">
               <h3 className="font-bold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2"><AlertTriangle size={20} /> Critical Warnings</h3>
               <ul className="space-y-2 list-disc pl-5 text-sm text-red-700 dark:text-red-300 font-medium">
                 {analysis.warnings.map(w => <li key={w}>{w}</li>)}
               </ul>
             </div>
          )}

          {/* Dosage Plan */}
          <div>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Zap size={20} className="text-primary-500" /> Optimized Dosage Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.dosage_plan?.map((item, i) => (
                <DosageCard key={i} item={item} index={i} />
              ))}
            </div>
          </div>

          {/* Interactions */}
          <div>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Shield size={20} className="text-indigo-500" /> Drug Interactions
            </h2>
            {analysis.interactions?.length > 0 ? (
              <div className="space-y-4">
                {analysis.interactions.map((item, i) => (
                  <InteractionAlert key={i} item={item} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 glass-card rounded-2xl">
                <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No Interactions Detected</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Your current medications appear safe to use together.</p>
              </div>
            )}
          </div>

          {/* Missed Dose & Lifestyle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
               <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><Clock size={16} className="text-amber-500"/> Missed Dose Plan</h3>
               <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                 {analysis.missed_dose || "If you miss a dose, consult your doctor or pharmacist immediately."}
               </p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
               <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><HeartPulse size={16} className="text-emerald-500"/> Lifestyle Recommendations</h3>
               <ul className="space-y-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 font-medium">
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
