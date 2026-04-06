import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Shield, Save, Eye, EyeOff, Heart, Weight, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingHealth, setSavingHealth] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [userForm, setUserForm] = useState({ displayName: '', email: '', currentPassword: '', newPassword: '' });
  const [healthForm, setHealthForm] = useState({ age: '', weight: '', gender: '', conditions: '', allergies: '' });

  const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${user?.token}` } });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile');
      setUserForm({
        displayName: data.user.displayName || '',
        email: data.user.email || '',
        currentPassword: '',
        newPassword: '',
      });
      setHealthForm({
        age: data.healthProfile.age || '',
        weight: data.healthProfile.weight || '',
        gender: data.healthProfile.gender || '',
        conditions: (data.healthProfile.conditions || []).join(', '),
        allergies: (data.healthProfile.allergies || []).join(', '),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const flash = (msg, type = 'success') => {
    if (type === 'success') { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); }
    else { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 4000); }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      const payload = { displayName: userForm.displayName, email: userForm.email };
      if (userForm.newPassword) {
        payload.currentPassword = userForm.currentPassword;
        payload.newPassword = userForm.newPassword;
      }
      await api.put('/profile/user', payload);
      setUserForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      flash('Account settings saved!');
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHealth = async (e) => {
    e.preventDefault();
    setSavingHealth(true);
    setErrorMsg('');
    try {
      await api.put('/profile/health', {
        age: healthForm.age ? parseInt(healthForm.age) : null,
        weight: healthForm.weight ? parseFloat(healthForm.weight) : null,
        gender: healthForm.gender,
        conditions: healthForm.conditions ? healthForm.conditions.split(',').map(s => s.trim()).filter(Boolean) : [],
        allergies: healthForm.allergies ? healthForm.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      });
      flash('Health profile updated!');
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSavingHealth(false);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="py-8 animate-fade-in max-w-4xl mx-auto">
      {/* Flash Messages */}
      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <CheckCircle size={20} /> <span className="font-semibold text-sm">{successMsg}</span>
        </motion.div>
      )}
      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <AlertCircle size={20} /> <span className="font-semibold text-sm">{errorMsg}</span>
        </motion.div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <User className="text-primary-600 dark:text-primary-400" size={32} /> Profile <span className="font-light">Settings</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your account and health information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Settings Card */}
        <motion.form onSubmit={handleSaveUser} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-800 dark:text-white">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg"><User size={18} /></div>
            Account Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
              <input disabled value={user?.username || ''} className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Display Name</label>
              <input value={userForm.displayName} onChange={e => setUserForm({ ...userForm, displayName: e.target.value })} placeholder="Your display name" className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500 font-medium text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="your@email.com" className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500 font-medium text-sm" />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Change Password</h3>
              <div className="space-y-3">
                <div className="relative">
                  <input type={showCurrentPw ? 'text' : 'password'} value={userForm.currentPassword} onChange={e => setUserForm({ ...userForm, currentPassword: e.target.value })} placeholder="Current password" className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500 font-medium text-sm" />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <input type={showNewPw ? 'text' : 'password'} value={userForm.newPassword} onChange={e => setUserForm({ ...userForm, newPassword: e.target.value })} placeholder="New password" className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500 font-medium text-sm" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="mt-6 w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition disabled:opacity-50">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Account'}
          </button>
        </motion.form>

        {/* Health Profile Card */}
        <motion.form onSubmit={handleSaveHealth} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-slate-900 dark:bg-slate-900/90 text-white rounded-2xl p-6 shadow-xl border border-slate-800 dark:border-slate-700">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
            <div className="p-2 bg-primary-900/50 text-primary-400 rounded-lg"><Heart size={18} /></div>
            Health Profile
          </h2>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">This data powers personalized AI dosage and interaction analysis.</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Calendar size={12} /> Age</label>
                <input type="number" value={healthForm.age} onChange={e => setHealthForm({ ...healthForm, age: e.target.value })} placeholder="e.g. 45" className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 outline-none text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Weight size={12} /> Weight (kg)</label>
                <input type="number" step="0.1" value={healthForm.weight} onChange={e => setHealthForm({ ...healthForm, weight: e.target.value })} placeholder="e.g. 70" className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 outline-none text-sm font-medium" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
              <select value={healthForm.gender} onChange={e => setHealthForm({ ...healthForm, gender: e.target.value })} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary-500 outline-none text-sm font-medium appearance-none">
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Conditions</label>
              <textarea value={healthForm.conditions} onChange={e => setHealthForm({ ...healthForm, conditions: e.target.value })} placeholder="E.g. Hypertension, Diabetes" className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 outline-none min-h-[60px] text-sm font-medium" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Allergies</label>
              <textarea value={healthForm.allergies} onChange={e => setHealthForm({ ...healthForm, allergies: e.target.value })} placeholder="E.g. Penicillin, Sulfa" className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 outline-none min-h-[60px] text-sm font-medium" />
            </div>
          </div>

          <button type="submit" disabled={savingHealth} className="mt-6 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 transition disabled:opacity-50">
            <Shield size={16} /> {savingHealth ? 'Updating...' : 'Save Health Profile'}
          </button>
        </motion.form>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 px-5 py-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40 text-center">
        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">⚕️ Your health data is used solely for generating personalized AI-powered insights. This is not a substitute for professional medical advice.</p>
      </div>
    </div>
  );
};

export default Profile;
