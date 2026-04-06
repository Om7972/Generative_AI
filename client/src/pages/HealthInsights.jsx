import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Pill, AlertTriangle, CheckCircle, Zap, Clock, Shield, ChevronRight, Loader2, Info } from 'lucide-react';

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
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{item.medication}</h3>
          <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold">{item.recommendedDosage}</p>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2 mb-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
      <Clock size={14} className="text-indigo-500" />
      <span>{item.timing}</span>
    </div>
    {item.precautions?.length > 0 && (
      <div className="mt-3 space-y-1.5">
        <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
          <AlertTriangle size={12} /> Precautions
        </h4>
        {item.precautions.map((p, i) => (
          <div key={i} className="text-xs text-slate-600 dark:text-slate-400 pl-4 border-l-2 border-amber-300 dark:border-amber-700 font-medium">{p}</div>
        ))}
      </div>
    )}
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
          <p className={`text-sm font-semibold ${c.text} mb-2`}>{item.description}</p>
          <div className="flex items-start gap-2 bg-white/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <ChevronRight size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.recommendation}</p>
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
  const [dosagePlan, setDosagePlan] = useState(null);
  const [interactions, setInteractions] = useState(null);
  const [genDosage, setGenDosage] = useState(false);
  const [genInteractions, setGenInteractions] = useState(false);
  const [dosageError, setDosageError] = useState('');
  const [interactionError, setInteractionError] = useState('');

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

  const generateDosage = async () => {
    if (!healthProfile?.age || !healthProfile?.weight) return setDosageError('Complete your health profile first (age & weight required). Go to Profile page.');
    if (medications.length === 0) return setDosageError('Add at least one medication from the Dashboard first.');
    setGenDosage(true); setDosageError(''); setDosagePlan(null);
    try {
      const { data } = await api.post('/ai/personalized-dosage', {
        age: healthProfile.age,
        weight: healthProfile.weight,
        gender: healthProfile.gender,
        conditions: healthProfile.conditions,
        allergies: healthProfile.allergies,
        medications: medications.map(m => ({ name: m.name })),
      });
      setDosagePlan(data);
    } catch (err) {
      setDosageError(err.response?.data?.message || 'Failed to generate dosage plan. Check your OpenAI API key.');
    } finally { setGenDosage(false); }
  };

  const checkInteractions = async () => {
    if (medications.length < 2) return setInteractionError('At least 2 medications needed to check interactions.');
    setGenInteractions(true); setInteractionError(''); setInteractions(null);
    try {
      const { data } = await api.post('/ai/check-interactions', {
        medications: medications.map(m => ({ name: m.name })),
        conditions: healthProfile?.conditions,
        allergies: healthProfile?.allergies,
      });
      setInteractions(data);
    } catch (err) {
      setInteractionError(err.response?.data?.message || 'Failed to check interactions. Check your OpenAI API key.');
    } finally { setGenInteractions(false); }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Brain className="text-primary-600 dark:text-primary-400" size={32} /> AI Health <span className="font-light">Insights</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Personalized dosage plans and drug interaction analysis powered by AI.</p>
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

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={generateDosage} disabled={genDosage}
          className="flex items-center gap-4 p-5 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl shadow-xl shadow-primary-500/20 font-bold transition disabled:opacity-60">
          {genDosage ? <Loader2 size={24} className="animate-spin" /> : <Zap size={24} />}
          <div className="text-left">
            <div className="text-base">Generate Personalized Dosage</div>
            <div className="text-xs text-primary-200 font-medium">AI-adjusted for your profile</div>
          </div>
        </motion.button>

        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={checkInteractions} disabled={genInteractions}
          className="flex items-center gap-4 p-5 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-500/20 font-bold transition disabled:opacity-60">
          {genInteractions ? <Loader2 size={24} className="animate-spin" /> : <Shield size={24} />}
          <div className="text-left">
            <div className="text-base">Check Drug Interactions</div>
            <div className="text-xs text-indigo-200 font-medium">Detect conflicts between medications</div>
          </div>
        </motion.button>
      </div>

      {/* Dosage Error */}
      {dosageError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <AlertTriangle size={18} /> <span className="font-semibold text-sm">{dosageError}</span>
        </motion.div>
      )}
      {interactionError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <AlertTriangle size={18} /> <span className="font-semibold text-sm">{interactionError}</span>
        </motion.div>
      )}

      {/* Loading Skeletons */}
      <AnimatePresence>
        {genDosage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Loader2 size={20} className="animate-spin text-primary-500" /> Generating Dosage Plan...</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}</div>
          </motion.div>
        )}
        {genInteractions && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Loader2 size={20} className="animate-spin text-indigo-500" /> Analyzing Interactions...</h2>
            <div className="space-y-4">{[1, 2].map(i => <SkeletonCard key={i} />)}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dosage Plan Results */}
      {dosagePlan && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Zap size={20} className="text-primary-500" /> Personalized Dosage Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dosagePlan.dosagePlan?.map((item, i) => (
              <DosageCard key={i} item={item} index={i} />
            ))}
          </div>
          {dosagePlan.generalAdvice && (
            <div className="mt-5 p-5 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-200 dark:border-primary-800/50">
              <h3 className="text-sm font-bold text-primary-800 dark:text-primary-400 mb-2 flex items-center gap-2"><Info size={16} /> General Advice</h3>
              <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">{dosagePlan.generalAdvice}</p>
            </div>
          )}
        </motion.section>
      )}

      {/* Interaction Results */}
      {interactions && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shield size={20} className="text-indigo-500" /> Drug Interaction Analysis
            </h2>
            {interactions.overallRisk && <RiskBadge severity={interactions.overallRisk} />}
          </div>

          {interactions.interactions?.length > 0 ? (
            <div className="space-y-4">
              {interactions.interactions.map((item, i) => (
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

          {interactions.summary && (
            <div className="mt-5 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800/50">
              <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-400 mb-2 flex items-center gap-2"><Info size={16} /> Safety Summary</h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">{interactions.summary}</p>
            </div>
          )}
        </motion.section>
      )}
    </div>
  );
};

export default HealthInsights;
