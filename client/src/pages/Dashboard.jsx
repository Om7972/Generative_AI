import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Clock, Pill, Trash2, Edit2, Zap, X, ShieldAlert, AlertTriangle,
  Lightbulb, Activity, Calendar as CalIcon, History, Bell, Mail, Sparkles,
  TrendingUp, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// UI Components
import {
  MedicationCard,
  RiskScoreMeter,
  AdherenceChart,
  RiskHeatmap,
  InsightTimeline,
  AIInsightCard,
  WarningAlert,
  ShimmerSkeleton,
} from '../components/ui';
import FloatingInput, { FloatingSelect } from '../components/ui/FloatingInput';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Dashboard = () => {
  const { user } = useAuth();

  // Tabs State
  const [activeTab, setActiveTab] = useState('overview');

  // Data States
  const [medications, setMedications] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);

  const [currentMed, setCurrentMed] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [guidanceResult, setGuidanceResult] = useState(null);

  // Form State for Medication
  const [formData, setFormData] = useState({ name: '', dosage: '', frequency: 'daily', timeOfIntake: '' });

  // Patient Profile state
  const [profile, setProfile] = useState({ age: '', conditions: '', allergies: '' });

  // Reminder Setting state
  const [reminderConfig, setReminderConfig] = useState({ email: '', sms: false });
  const [sendingReminder, setSendingReminder] = useState(false);

  const fetchMedications = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/medications', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMedications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/ai/history', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setHistoryLogs(data);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMedications();
    fetchHistory();
  }, []);

  const handleOpenMedModal = (med = null) => {
    if (med) {
      setCurrentMed(med);
      setFormData({ name: med.name, dosage: med.dosage, frequency: med.frequency, timeOfIntake: med.timeOfIntake });
    } else {
      setCurrentMed(null);
      setFormData({ name: '', dosage: '', frequency: 'daily', timeOfIntake: '' });
    }
    setIsMedModalOpen(true);
  };

  const handleMedSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (currentMed) {
        await axios.put(`http://localhost:5000/api/medications/${currentMed._id}`, formData, config);
        toast.success('Medication updated');
      } else {
        await axios.post('http://localhost:5000/api/medications', formData, config);
        toast.success('Medication added');
      }
      fetchMedications();
      setIsMedModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving medication');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this medication?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/medications/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Medication removed');
      fetchMedications();
    } catch (err) {
      console.error(err);
    }
  };

  const generateGuidance = async () => {
    if (medications.length === 0) return toast.error("Please add medications first.");
    setIsGuidanceOpen(true);
    setGenerating(true);
    setGuidanceResult(null);

    try {
      const payload = {
        medications: medications,
        age: parseInt(profile.age) || null,
        conditions: profile.conditions ? profile.conditions.split(',').map(s => s.trim()) : [],
        allergies: profile.allergies ? profile.allergies.split(',').map(s => s.trim()) : [],
      };
      const { data } = await axios.post('http://localhost:5000/api/ai/generate-guidance', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setGuidanceResult(data);
      fetchHistory();
      toast.success('AI analysis complete');
    } catch (err) {
      setGuidanceResult({ error: "Failed to generate AI guidance." });
      toast.error('Analysis failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSetupReminders = async () => {
    if (!reminderConfig.email) return toast.error('Enter email to setup reminders');
    setSendingReminder('email');
    try {
      if ('Notification' in window) {
         if (Notification.permission !== 'granted') await Notification.requestPermission();
         if (Notification.permission === 'granted') {
            new Notification('MediGuide AI', { body: 'Reminders have been successfully configured.' });
         }
      }

      const payload = { email: reminderConfig.email, message: "Weekly Medication schedule has been set up! You have active medications.", type: "setup" };
      await axios.post('http://localhost:5000/api/reminders/send', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      toast.success('Reminders configured!');
    } catch(err) {
      toast.error('Failed to configure reminders');
    } finally {
       setSendingReminder(null);
    }
  };

  // Render Risk Badge
  const getRiskBadge = (risk) => {
    const RiskMap = {
       "Low": "bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-900/40 dark:text-accent-300 dark:border-accent-800",
       "Medium": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
       "High": "bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-900/40 dark:text-danger-300 dark:border-danger-800",
       "Unknown": "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
    };
    return (
       <span className={cn("px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider", RiskMap[risk] || RiskMap["Unknown"])}>
         {risk} Risk
       </span>
    );
  };

  // Skeleton loading state
  if (loading) return (
    <div className="py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl shimmer-bg" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg shimmer-bg" />
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg shimmer-bg" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ShimmerSkeleton variant="card" count={6} />
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', icon: Activity, label: 'Overview' },
    { id: 'medications', icon: Pill, label: 'Medications' },
    { id: 'calendar', icon: CalIcon, label: 'Calendar' },
    { id: 'history', icon: History, label: 'AI History' },
  ];

  return (
    <div className="py-6 animate-fade-in relative z-10 text-slate-900 dark:text-slate-100">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <div className="p-2.5 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 rounded-2xl text-primary-600 dark:text-primary-400 shadow-sm border border-primary-200/50 dark:border-primary-800/50">
              <Activity size={28} />
            </div>
            <span>
              Medi<span className="font-light">Panel</span>
            </span>
          </motion.h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm">
            Welcome back, <span className="font-bold text-slate-700 dark:text-slate-300">{user?.username}</span>. Here's your health overview.
          </p>
        </div>

        {/* Analyze button */}
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateGuidance}
          className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-primary-500/20 transition-all text-sm"
          id="analyze-risks-btn"
        >
          <Sparkles size={18} />
          Analyze All Risks
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="glass-panel p-1.5 rounded-2xl flex gap-1 mb-8 overflow-x-auto shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 rounded-xl font-semibold text-sm transition-all focus:outline-none flex whitespace-nowrap items-center gap-2",
              activeTab === tab.id
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
            )}
            id={`tab-${tab.id}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Tab: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Today's Medications", value: medications.filter(m => m.frequency === 'daily').length, icon: Pill, color: 'primary' },
                { label: 'Total Prescriptions', value: medications.length, icon: Activity, color: 'accent' },
                { label: 'AI Reports', value: historyLogs.length, icon: Sparkles, color: 'violet' },
                { label: 'Upcoming Reminders', value: medications.filter(m => m.frequency === 'daily').length, icon: Bell, color: 'amber' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card rounded-2xl p-5 cursor-default"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${
                      stat.color === 'primary' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' :
                      stat.color === 'accent' ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400' :
                      stat.color === 'violet' ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' :
                      'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    }`}>
                      <stat.icon size={18} />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Medications */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Pill size={18} className="text-primary-500" /> Today's Medications
                  </h2>
                  <button
                    onClick={() => handleOpenMedModal()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-bold border border-primary-200/50 dark:border-primary-800/50 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                    id="add-medication-btn"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>

                {medications.length === 0 ? (
                  <div className="text-center py-16 glass-card rounded-2xl border-dashed">
                    <Pill size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No medications yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Add your prescriptions to begin AI analysis.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {medications.map((med, i) => (
                      <MedicationCard
                        key={med._id}
                        med={med}
                        index={i}
                        onEdit={handleOpenMedModal}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}

                {/* Adherence Chart */}
                <AdherenceChart medications={medications} title="Weekly Adherence" />
              </div>

              {/* Right Sidebar */}
              <div className="space-y-4">
                {/* Risk Score */}
                <div className="glass-card rounded-2xl p-6 flex justify-center">
                  <RiskScoreMeter
                    score={medications.length > 3 ? 72 : medications.length > 1 ? 38 : 15}
                    label="Overall Risk"
                    severity={medications.length > 3 ? 'high' : medications.length > 1 ? 'medium' : 'low'}
                  />
                </div>

                {/* AI Insight Timeline */}
                <InsightTimeline />

                {/* Risk Heatmap (if exists) */}
                <RiskHeatmap interactions={guidanceResult?.interactions || []} />

                {/* Upcoming Reminders */}
                <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                      <Bell size={14} />
                    </div>
                    Upcoming Reminders
                  </h3>
                  {medications.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No active reminders. Add medications first.</p>
                  ) : (
                    <div className="space-y-2">
                      {medications.slice(0, 4).map((med, i) => (
                        <motion.div
                          key={med._id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.06 }}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-accent-400" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{med.name}</span>
                          </div>
                          <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400">{med.timeOfIntake}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Reminder email setup */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex relative">
                      <div className="absolute left-3 top-2.5 text-slate-400"><Mail size={14}/></div>
                      <input
                        type="email"
                        value={reminderConfig.email}
                        onChange={e => setReminderConfig({...reminderConfig, email: e.target.value})}
                        placeholder="Email for reminders"
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-primary-500 transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleSetupReminders}
                      disabled={sendingReminder === 'email'}
                      className="w-full py-2 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-primary-200/50 dark:border-primary-800/50"
                    >
                      {sendingReminder === 'email' ? 'Setting up...' : 'Enable Reminders'}
                    </button>
                  </div>
                </div>

                {/* Patient Context Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-800 text-white rounded-2xl p-5 shadow-xl border border-slate-700/50">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-primary-400" /> Patient Context
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Age</label>
                      <input type="number" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 outline-none text-xs font-medium" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conditions</label>
                      <textarea value={profile.conditions} onChange={e => setProfile({...profile, conditions: e.target.value})} className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 outline-none min-h-[50px] text-xs font-medium" placeholder="E.g. Asthma, Hypertension" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Allergies</label>
                      <textarea value={profile.allergies} onChange={e => setProfile({...profile, allergies: e.target.value})} className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 outline-none min-h-[50px] text-xs font-medium" placeholder="E.g. Penicillin" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Tab: MEDICATIONS ── */}
        {activeTab === 'medications' && (
          <motion.div key="meds" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Pill size={20} className="text-primary-500" /> All Medications
              </h2>
              <div className="flex gap-2">
                <button onClick={() => handleOpenMedModal()} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-sm">
                  <Plus size={16} /> Add Medication
                </button>
                <motion.button
                  whileHover={{scale:1.02}} whileTap={{scale:0.95}}
                  onClick={generateGuidance}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 transition-all"
                >
                  <Zap size={16}/> Analyze Risks
                </motion.button>
              </div>
            </div>

            {medications.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl border-dashed">
                <Pill size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No medications yet</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Add your prescriptions to begin analysis.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {medications.map((med, i) => (
                  <MedicationCard key={med._id} med={med} index={i} onEdit={handleOpenMedModal} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Tab: CALENDAR ── */}
        {activeTab === 'calendar' && (
          <motion.div key="cal" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
            <div className="glass-card rounded-2xl p-5 overflow-hidden">
              <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-inner">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="bg-slate-50 dark:bg-slate-800 text-center py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{d}</div>
                ))}
                {Array.from({length: 14}).map((_, i) => {
                  const currentDay = addDays(startOfWeek(new Date()), i);
                  const isToday = isSameDay(currentDay, new Date());
                  return (
                    <div key={i} className={cn("bg-white dark:bg-slate-900 h-28 p-2 pt-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50", isToday && "bg-primary-50/50 dark:bg-primary-900/10")}>
                      <span className={cn("inline-block w-7 h-7 leading-7 text-center rounded-full text-xs font-bold", isToday ? "bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-md" : "text-slate-700 dark:text-slate-300")}>
                        {format(currentDay, 'd')}
                      </span>
                      <div className="mt-1.5 space-y-1 overflow-y-auto max-h-[65px]">
                        {medications.map(med => (med.frequency === 'daily' || isToday) ? (
                          <div key={med._id} title={med.name} className="truncate text-[9px] font-bold px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded border border-primary-200/50 dark:border-primary-800/50">
                            <span className="text-primary-500 mr-0.5">{med.timeOfIntake}</span> {med.name}
                          </div>
                        ) : null)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Tab: AI HISTORY ── */}
        {activeTab === 'history' && (
          <motion.div key="hist" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
            {historyLogs.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl border-dashed">
                <History size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No AI history found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Generate some guidance to see records here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {historyLogs.map((log, li) => (
                  <motion.div
                    key={log._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: li * 0.05 }}
                    className="glass-card p-5 rounded-2xl flex flex-col md:flex-row gap-5"
                  >
                    <div className="md:w-1/4 border-r-0 md:border-r border-slate-200 dark:border-slate-700 pr-0 md:pr-4">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest block mb-2">{format(new Date(log.createdAt), 'MMM d, yyyy - h:mm a')}</span>
                      {getRiskBadge(log.report?.riskLevel)}
                      <div className="mt-3">
                        <span className="text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-widest">Context:</span>
                        <div className="flex flex-wrap gap-1">
                          {log.context?.medications?.map((m,i) => (
                            <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">{m.name}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400 mb-2"><AlertTriangle size={12} /> Warnings</h4>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4 font-medium">
                          {log.report?.warnings?.length > 0 ? log.report.warnings.map((w,i) => <li key={i}>{w}</li>) : <li>None</li>}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold flex items-center gap-1.5 text-primary-700 dark:text-primary-400 mb-2"><Lightbulb size={12} /> Tips</h4>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4 font-medium">
                          {log.report?.tips?.length > 0 ? log.report.tips.slice(0,3).map((w,i) => <li key={i}>{w}</li>) : <li>None</li>}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>


      {/* ─── Modals ─── */}

      {/* Medication Form Modal */}
      <AnimatePresence>
        {isMedModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsMedModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md relative z-10 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
                <h3 className="text-lg font-bold dark:text-white">{currentMed ? 'Edit Medication' : 'New Medication'}</h3>
                <button onClick={() => setIsMedModalOpen(false)} className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"><X size={16}/></button>
              </div>
              <form onSubmit={handleMedSubmit} className="p-6 space-y-4">
                <FloatingInput
                  id="med-name"
                  label="Medicine Name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
                <FloatingInput
                  id="med-dosage"
                  label="Dosage / Instructions"
                  value={formData.dosage}
                  onChange={e => setFormData({...formData, dosage: e.target.value})}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <FloatingSelect
                    id="med-frequency"
                    label="Frequency"
                    value={formData.frequency}
                    onChange={e => setFormData({...formData, frequency: e.target.value})}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">As needed</option>
                  </FloatingSelect>
                  <FloatingInput
                    id="med-time"
                    type="time"
                    label="Time"
                    value={formData.timeOfIntake}
                    onChange={e => setFormData({...formData, timeOfIntake: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="w-full mt-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-primary-500/20 transition-all text-sm">
                  {currentMed ? 'Update Medication' : 'Add to Regimen'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guidance Modal */}
      <AnimatePresence>
        {isGuidanceOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsGuidanceOpen(false)} />

            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl relative z-10 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/40 dark:to-indigo-900/30 text-primary-700 dark:text-primary-400 rounded-2xl shadow-sm">
                    <Zap size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight dark:text-white">AI Guardian Analysis</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Complete regimen safety report</p>
                      {guidanceResult && !generating && guidanceResult.riskLevel && getRiskBadge(guidanceResult.riskLevel)}
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsGuidanceOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"><X size={20} /></button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900">
                {generating ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full" />
                      <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Cross-referencing databases...</h3>
                    <p className="text-slate-500 dark:text-slate-400 animate-pulse text-sm font-medium">Running interactions against your profile</p>
                  </div>
                ) : guidanceResult?.error ? (
                  <WarningAlert severity="high" title="Analysis Interrupted" message={guidanceResult.error} />
                ) : guidanceResult ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Warnings */}
                    <div className="md:col-span-2">
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/15 dark:to-orange-900/10 rounded-2xl p-5 border border-amber-200/50 dark:border-amber-700/30 relative overflow-hidden">
                        <h4 className="font-bold text-amber-900 dark:text-amber-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                          <AlertTriangle size={16} /> Critical Advisory
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {guidanceResult.warnings?.map((warn, i) => (
                            <WarningAlert key={i} severity="medium" message={warn} index={i} />
                          ))}
                        </div>
                        {(guidanceResult.interactions?.length > 0) && (
                          <div className="mt-5 pt-5 border-t border-amber-200/50 dark:border-amber-800/50">
                            <h5 className="font-bold text-danger-800 dark:text-danger-400 mb-3 text-xs flex items-center gap-2 uppercase tracking-wider">
                              <Zap size={14}/> Interaction Detections ({guidanceResult.interactions.length})
                            </h5>
                            <div className="space-y-2">
                              {guidanceResult.interactions.map((int, i) => (
                                <WarningAlert key={i} severity="high" message={int} index={i} glow />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reminders Timeline */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                      <h4 className="font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2 text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
                        <Clock size={16} className="text-primary-500" /> Daily Protocol
                      </h4>
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800 before:z-0">
                        {guidanceResult.reminders?.map((rem, i) => (
                          <div key={i} className="relative flex items-start gap-4 z-10 group">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-primary-500 flex-shrink-0 z-10 group-hover:scale-110 transition-transform">
                              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-3 py-2.5 rounded-xl rounded-tl-sm border border-slate-100 dark:border-slate-700 flex-1">
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug">{rem}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-primary-50/50 dark:bg-primary-900/10 rounded-2xl p-5 border border-primary-100 dark:border-primary-900/30 flex flex-col h-full">
                      <h4 className="font-bold text-primary-900 dark:text-primary-400 mb-5 flex items-center gap-2 text-sm border-b border-primary-100 dark:border-primary-900/50 pb-3">
                        <Lightbulb size={16} className="text-primary-500" /> Efficacy Strategies
                      </h4>
                      <div className="grid gap-2.5 flex-1 content-start">
                        {guidanceResult.tips?.map((tip, i) => (
                          <AIInsightCard key={i} type="tip" title={tip} index={i} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-end">
                <button onClick={() => setIsGuidanceOpen(false)} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all shadow-md text-sm hover:opacity-90">
                  Dismiss Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
