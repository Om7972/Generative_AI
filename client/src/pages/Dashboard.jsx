import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Clock, Pill, Trash2, Edit2, Zap, X, ShieldAlert, AlertTriangle, Lightbulb, Activity, Calendar as CalIcon, History, Bell, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for strict Tailwind merging
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Dashboard = () => {
  const { user } = useAuth();
  
  // Tabs State
  const [activeTab, setActiveTab] = useState('medications'); // medications, calendar, history
  
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
      } else {
        await axios.post('http://localhost:5000/api/medications', formData, config);
      }
      fetchMedications();
      setIsMedModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving medication');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this medication?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/medications/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchMedications();
    } catch (err) {
      console.error(err);
    }
  };

  const generateGuidance = async () => {
    if (medications.length === 0) return alert("Please add medications first.");
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
      fetchHistory(); // refresh history automatically
    } catch (err) {
      setGuidanceResult({ error: "Failed to generate AI guidance." });
    } finally {
      setGenerating(false);
    }
  };

  const handleSetupReminders = async () => {
    if (!reminderConfig.email) return alert('Enter email to setup reminders');
    setSendingReminder('email');
    try {
      // First attempt browser notification
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
      
      alert('Email reminder configured successfully!');
    } catch(err) {
      alert('Failed to configure reminders');
    } finally {
       setSendingReminder(null);
    }
  };

  // Render Risk Badge
  const getRiskBadge = (risk) => {
    const RiskMap = {
       "Low": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
       "Medium": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
       "High": "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800",
       "Unknown": "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
    };
    return (
       <span className={cn("px-2.5 py-1 text-xs font-bold rounded-md border", RiskMap[risk] || RiskMap["Unknown"])}>
         Risk: {risk}
       </span>
    );
  };

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><div className="w-12 h-12 border-4 border-primary-500 border-t-primary-100 rounded-full animate-spin"></div></div>;

  return (
    <div className="py-8 animate-fade-in relative z-10 text-slate-900 dark:text-slate-100">
      
      {/* Header Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
             <Activity className="text-primary-600 dark:text-primary-500" size={32} /> Medi<span className="font-light">Panel</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Configure routines, view calendar, and analyze records.</p>
        </div>
        
        <div className="glass-panel p-1.5 rounded-xl flex gap-1 w-full md:w-auto shadow-sm overflow-x-auto">
          <button onClick={()=>setActiveTab('medications')} className={cn("px-4 py-2 rounded-lg font-medium text-sm transition-all focus:outline-none flex whitespace-nowrap items-center gap-2", activeTab === 'medications' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50")}>
            <Pill size={16} /> Medications
          </button>
          <button onClick={()=>setActiveTab('calendar')} className={cn("px-4 py-2 rounded-lg font-medium text-sm transition-all focus:outline-none flex whitespace-nowrap items-center gap-2", activeTab === 'calendar' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50")}>
            <CalIcon size={16} /> Calendar
          </button>
          <button onClick={()=>setActiveTab('history')} className={cn("px-4 py-2 rounded-lg font-medium text-sm transition-all focus:outline-none flex whitespace-nowrap items-center gap-2", activeTab === 'history' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50")}>
            <History size={16} /> AI History
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* --- Tab 1: MEDICATIONS --- */}
        {activeTab === 'medications' && (
          <motion.div key="med" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Your Current Regimen</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenMedModal()} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                      <Plus size={16} /> Add Med
                    </button>
                    <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.95}} onClick={generateGuidance} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold shadow-md shadow-primary-500/20 flex items-center gap-2 transition-colors">
                      <Zap size={16}/> Analyze Total Risks
                    </motion.button>
                  </div>
                </div>

                {medications.length === 0 ? (
                  <div className="text-center py-20 glass-card rounded-2xl border-dashed">
                    <Pill size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No medications yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Add your prescriptions right away to begin safely analyzing them.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {medications.map((med) => (
                      <div key={med._id} className="glass-card p-5 rounded-2xl relative group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary-50 dark:bg-slate-800/80 rounded-lg text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-slate-700">
                              <Pill size={20} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[150px]">{med.name}</h3>
                              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{med.dosage}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenMedModal(med)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-md">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(med._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-md">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm pt-2">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md">
                            <Clock size={14} className="text-primary-500 dark:text-primary-400" />
                            <span className="capitalize">{med.frequency}</span>
                          </div>
                          <span className="font-bold text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/60 border border-primary-200 dark:border-primary-800 px-3 py-1 rounded-md">
                            {med.timeOfIntake}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>

             <div className="lg:col-span-1 space-y-6">
                {/* Profile Card */}
                <div className="bg-slate-900 dark:bg-slate-900/90 text-white rounded-2xl p-6 shadow-xl border border-slate-800 dark:border-slate-700">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <ShieldAlert size={20} className="text-primary-400" /> Patient Context
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Age</label>
                      <input type="number" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 outline-none text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Conditions</label>
                      <textarea value={profile.conditions} onChange={e => setProfile({...profile, conditions: e.target.value})} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 outline-none min-h-[60px] text-sm font-medium" placeholder="E.g. Asthma, Hypertension" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Allergies</label>
                      <textarea value={profile.allergies} onChange={e => setProfile({...profile, allergies: e.target.value})} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 outline-none min-h-[60px] text-sm font-medium" placeholder="E.g. Penicillin" />
                    </div>
                  </div>
                </div>

                {/* Reminder Setup Card */}
                <div className="glass-card rounded-2xl p-6 border-indigo-100 dark:border-indigo-900/50">
                  <h2 className="font-bold text-lg mb-2 flex items-center gap-2 text-indigo-900 dark:text-indigo-400">
                    <Bell size={20} /> Smart Reminders
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">Opt-in to push notifications & email reminders when it's time.</p>
                  
                  <div className="space-y-3">
                     <div className="flex relative">
                        <div className="absolute left-3 top-2.5 text-slate-400"><Mail size={16}/></div>
                        <input type="email" value={reminderConfig.email} onChange={e=>setReminderConfig({...reminderConfig, email: e.target.value})} placeholder="Email address" className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500" />
                     </div>
                     <button onClick={handleSetupReminders} disabled={sendingReminder === 'email'} className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                        {sendingReminder === 'email' ? 'Setup in progress...' : 'Enable Reminders'}
                     </button>
                  </div>
                </div>
             </div>
          </motion.div>
        )}

        {/* --- Tab 2: CALENDAR --- */}
        {activeTab === 'calendar' && (
          <motion.div key="cal" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
             <div className="glass-card rounded-3xl p-6 mb-8 overflow-hidden">
               <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-inner">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d=>(
                     <div key={d} className="bg-slate-50 dark:bg-slate-800 text-center py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{d}</div>
                  ))}
                  
                  {Array.from({length: 14}).map((_, i) => {
                     // Very rudimentary 2-week view mapping
                     const currentDay = addDays(startOfWeek(new Date()), i);
                     const isToday = isSameDay(currentDay, new Date());

                     return (
                       <div key={i} className={cn("bg-white dark:bg-slate-900 h-32 p-2 pt-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50", isToday && "bg-primary-50/50 dark:bg-primary-900/20")}>
                          <span className={cn("inline-block w-7 h-7 leading-7 text-center rounded-full text-sm font-semibold", isToday ? "bg-primary-600 text-white shadow-md" : "text-slate-700 dark:text-slate-300")}>
                            {format(currentDay, 'd')}
                          </span>
                          <div className="mt-2 space-y-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                             {medications.map(med => (med.frequency === 'daily' || isToday) ? (
                                <div key={med._id} title={med.name} className="truncate text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                                   <span className="text-primary-500 mr-1">{med.timeOfIntake}</span> {med.name}
                                </div>
                             ) : null)}
                          </div>
                       </div>
                     )
                  })}
               </div>
             </div>
          </motion.div>
        )}

        {/* --- Tab 3: HISTORY --- */}
        {activeTab === 'history' && (
          <motion.div key="hist" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
             {historyLogs.length === 0 ? (
               <div className="text-center py-20 glass-card rounded-2xl border-dashed">
                 <History size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                 <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No AI history found</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">Generate some guidance to see previous records here.</p>
               </div>
             ) : (
               <div className="grid gap-4">
                 {historyLogs.map(log => (
                    <div key={log._id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-6">
                       <div className="md:w-1/4 border-r border-slate-200 dark:border-slate-700 pr-4">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block mb-2">{format(new Date(log.createdAt), 'MMM d, yyyy - h:mm a')}</span>
                          {getRiskBadge(log.report?.riskLevel)}
                          
                          <div className="mt-4">
                             <span className="text-xs text-slate-500 font-semibold block mb-1">Context Applied:</span>
                             <div className="flex flex-wrap gap-1">
                                {log.context?.medications?.map((m,i)=>(
                                   <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">{m.name}</span>
                                ))}
                             </div>
                          </div>
                       </div>
                       
                       <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                             <h4 className="text-sm font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400 mb-2"><AlertTriangle size={14} /> Warnings</h4>
                             <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                                {log.report?.warnings?.length > 0 ? log.report.warnings.map((w,i)=><li key={i}>{w}</li>) : <li>None</li>}
                             </ul>
                          </div>
                          <div>
                             <h4 className="text-sm font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 mb-2"><Lightbulb size={14} /> Tips</h4>
                             <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                                {log.report?.tips?.length > 0 ? log.report.tips.slice(0,3).map((w,i)=><li key={i}>{w}</li>) : <li>None</li>}
                             </ul>
                          </div>
                       </div>
                    </div>
                 ))}
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>


      {/* Modals & Overlays down here (Form Modal, Guidance Modal implementation similar to previous but fully themed) */}
      
      <AnimatePresence>
        {isMedModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsMedModalOpen(false)}></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md relative z-10 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
               <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
                 <h3 className="text-xl font-bold dark:text-white">{currentMed ? 'Edit Medication' : 'New Preset'}</h3>
                 <button onClick={() => setIsMedModalOpen(false)} className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"><X size={18}/></button>
               </div>
               <form onSubmit={handleMedSubmit} className="p-6 space-y-5">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Medicine Detail</label>
                     <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500 font-medium" placeholder="E.g. Lisinopril 20mg" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Instructions / Dosage</label>
                     <input type="text" required value={formData.dosage} onChange={e=>setFormData({...formData, dosage: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500 font-medium" placeholder="E.g. Take 1 pill orally" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Recurrence</label>
                        <select value={formData.frequency} onChange={e=>setFormData({...formData, frequency: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500 font-medium appearance-none">
                           <option value="daily">Daily</option>
                           <option value="weekly">Weekly</option>
                           <option value="custom">As needed</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Time Slot</label>
                        <input type="time" required value={formData.timeOfIntake} onChange={e=>setFormData({...formData, timeOfIntake: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500 font-bold" />
                     </div>
                  </div>
                  <button type="submit" className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-primary-500/25 transition">
                     {currentMed ? 'Confirm Updates' : 'Add to Regimen'}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGuidanceOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsGuidanceOpen(false)}></motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl relative z-10 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-2xl shadow-inner">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight dark:text-white">AI Guardian Analysis</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Complete regimen safety report</p>
                      {guidanceResult && !generating && guidanceResult.riskLevel && getRiskBadge(guidanceResult.riskLevel)}
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsGuidanceOpen(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"><X size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-900 custom-scrollbar">
                 {generating ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Cross-referencing databases...</h3>
                    <p className="text-slate-500 dark:text-slate-400 animate-pulse text-sm font-medium">Running interactions against your profile constraints</p>
                  </div>
                ) : guidanceResult?.error ? (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-2xl border border-red-200 dark:border-red-800/50 flex items-start gap-4">
                     <ShieldAlert size={24} className="mt-0.5 flex-shrink-0" />
                     <div>
                       <h4 className="font-bold text-lg mb-1">Analysis Interrupted</h4>
                       <p className="font-medium text-sm text-red-600 dark:text-red-300">{guidanceResult.error}</p>
                     </div>
                  </div>
                ) : guidanceResult ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Warnings (Alerts) */}
                    <div className="md:col-span-2">
                       <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-3xl p-6 border border-amber-200/60 dark:border-amber-700/30 shadow-sm relative overflow-hidden">
                          <h4 className="font-black text-amber-900 dark:text-amber-500 mb-5 flex items-center gap-2 text-lg uppercase tracking-wider text-sm">
                            <AlertTriangle size={18} /> Critical Advisory
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            {guidanceResult.warnings?.map((warn, i) => (
                              <div key={i} className="flex gap-3 bg-white/60 dark:bg-slate-900/40 backdrop-blur p-4 rounded-xl border border-amber-100 dark:border-amber-800/30 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span>
                                <span className="text-[14px] font-semibold text-amber-950 dark:text-amber-100 leading-snug">{warn}</span>
                              </div>
                            ))}
                          </div>
                          {(guidanceResult.interactions?.length > 0) && (
                             <div className="mt-6 pt-6 border-t border-amber-200/50 dark:border-amber-800/50">
                               <h5 className="font-bold text-rose-800 dark:text-rose-400 mb-4 text-sm flex items-center gap-2">
                                 <Zap size={16}/> Interaction Detections ({guidanceResult.interactions.length})
                               </h5>
                               <div className="space-y-3">
                                 {guidanceResult.interactions.map((int, i) => (
                                   <div key={i} className="flex gap-3 bg-rose-50/80 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-100 dark:border-rose-800/30">
                                     <span className="font-semibold text-rose-900 dark:text-rose-100 text-[14px] leading-snug">{int}</span>
                                   </div>
                                 ))}
                               </div>
                             </div>
                          )}
                       </div>
                    </div>

                    {/* Reminders (Timeline) */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 text-lg border-b border-slate-100 dark:border-slate-800 pb-3">
                          <Clock size={20} className="text-blue-500" /> Daily Protocol
                        </h4>
                        <div className="space-y-5 relative before:absolute before:inset-0 before:ml-[13px] before:h-full before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800 before:z-0">
                          {guidanceResult.reminders?.map((rem, i) => (
                            <div key={i} className="relative flex items-start gap-4 z-10 group">
                               <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 flex-shrink-0 z-10 group-hover:scale-110 transition-transform">
                                 <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                               </div>
                               <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700 flex-1">
                                  <span className="text-[14px] font-semibold text-slate-700 dark:text-slate-200 leading-snug">{rem}</span>
                               </div>
                            </div>
                          ))}
                        </div>
                    </div>

                    {/* Tips (Cards) */}
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/30 flex flex-col h-full">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-400 mb-6 flex items-center gap-2 text-lg border-b border-indigo-100 dark:border-indigo-900/50 pb-3">
                          <Lightbulb size={20} className="text-indigo-500" /> Efficacy Strategies
                        </h4>
                        <div className="grid gap-3 flex-1 content-start">
                          {guidanceResult.tips?.map((tip, i) => (
                            <div key={i} className="flex gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                              <span className="text-[14px] font-semibold text-slate-700 dark:text-slate-200 leading-snug">{tip}</span>
                            </div>
                          ))}
                        </div>
                    </div>

                  </div>
                ) : null}
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 py-5 flex justify-end">
                <button onClick={() => setIsGuidanceOpen(false)} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all shadow-md">Dismiss Report</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
