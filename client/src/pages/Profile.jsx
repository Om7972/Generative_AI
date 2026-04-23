import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Shield, Save, Eye, EyeOff, Heart, Weight, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import FloatingInput, { FloatingTextarea, FloatingSelect } from '../components/ui/FloatingInput';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingHealth, setSavingHealth] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [userForm, setUserForm] = useState({ displayName: '', email: '', currentPassword: '', newPassword: '' });
  const [healthForm, setHealthForm] = useState({ age: '', weight: '', gender: '', conditions: '', allergies: '' });

  const api = axios.create({ baseURL: '/api', headers: { Authorization: `Bearer ${user?.token}` } });

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

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { displayName: userForm.displayName, email: userForm.email };
      if (userForm.newPassword) {
        payload.currentPassword = userForm.currentPassword;
        payload.newPassword = userForm.newPassword;
      }
      await api.put('/profile/user', payload);
      setUserForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      toast.success('Account settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHealth = async (e) => {
    e.preventDefault();
    setSavingHealth(true);
    try {
      await api.put('/profile/health', {
        age: healthForm.age ? parseInt(healthForm.age) : null,
        weight: healthForm.weight ? parseFloat(healthForm.weight) : null,
        gender: healthForm.gender,
        conditions: healthForm.conditions ? healthForm.conditions.split(',').map(s => s.trim()).filter(Boolean) : [],
        allergies: healthForm.allergies ? healthForm.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      });
      toast.success('Health profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSavingHealth(false);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 animate-pulse">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="py-6 animate-fade-in max-w-4xl mx-auto" id="profile-page">
      {/* Page Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <div className="p-2.5 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 rounded-2xl text-primary-600 dark:text-primary-400 shadow-sm border border-primary-200/50 dark:border-primary-800/50">
            <User size={28} />
          </div>
          <span>
            Profile <span className="font-light">Settings</span>
          </span>
        </motion.h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm">Manage your account and health information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings Card */}
        <motion.form onSubmit={handleSaveUser} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold mb-5 flex items-center gap-2 text-slate-800 dark:text-white">
            <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-indigo-800/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <User size={16} />
            </div>
            Account Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Username</label>
              <input disabled value={user?.username || ''} className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium text-sm cursor-not-allowed" />
            </div>
            <FloatingInput
              id="profile-display-name"
              label="Display Name"
              value={userForm.displayName}
              onChange={e => setUserForm({ ...userForm, displayName: e.target.value })}
            />
            <FloatingInput
              id="profile-email"
              type="email"
              label="Email"
              value={userForm.email}
              onChange={e => setUserForm({ ...userForm, email: e.target.value })}
            />

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Change Password</h3>
              <div className="space-y-3">
                <div className="relative">
                  <FloatingInput
                    id="profile-current-pw"
                    type={showCurrentPw ? 'text' : 'password'}
                    label="Current Password"
                    value={userForm.currentPassword}
                    onChange={e => setUserForm({ ...userForm, currentPassword: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                    {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="relative">
                  <FloatingInput
                    id="profile-new-pw"
                    type={showNewPw ? 'text' : 'password'}
                    label="New Password"
                    value={userForm.newPassword}
                    onChange={e => setUserForm({ ...userForm, newPassword: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                    {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="mt-6 w-full py-3 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition disabled:opacity-50">
            <Save size={14} /> {saving ? 'Saving...' : 'Save Account'}
          </button>
        </motion.form>

        {/* Health Profile Card */}
        <motion.form onSubmit={handleSaveHealth} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-800 text-white rounded-2xl p-6 shadow-xl border border-slate-700/50">
          <h2 className="text-base font-bold mb-5 flex items-center gap-2">
            <div className="p-2 bg-primary-900/50 text-primary-400 rounded-xl">
              <Heart size={16} />
            </div>
            Health Profile
          </h2>
          <p className="text-[11px] text-slate-400 mb-5 leading-relaxed">This data powers personalized AI dosage and interaction analysis.</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Calendar size={10} /> Age</label>
                <input type="number" value={healthForm.age} onChange={e => setHealthForm({ ...healthForm, age: e.target.value })} placeholder="e.g. 45" className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 outline-none text-xs font-medium transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Weight size={10} /> Weight (kg)</label>
                <input type="number" step="0.1" value={healthForm.weight} onChange={e => setHealthForm({ ...healthForm, weight: e.target.value })} placeholder="e.g. 70" className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 outline-none text-xs font-medium transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Gender</label>
              <select value={healthForm.gender} onChange={e => setHealthForm({ ...healthForm, gender: e.target.value })} className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-primary-500 outline-none text-xs font-medium appearance-none transition-colors">
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Conditions</label>
              <textarea value={healthForm.conditions} onChange={e => setHealthForm({ ...healthForm, conditions: e.target.value })} placeholder="E.g. Hypertension, Diabetes" className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 outline-none min-h-[55px] text-xs font-medium transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Allergies</label>
              <textarea value={healthForm.allergies} onChange={e => setHealthForm({ ...healthForm, allergies: e.target.value })} placeholder="E.g. Penicillin, Sulfa" className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 outline-none min-h-[55px] text-xs font-medium transition-colors" />
            </div>
          </div>

          <button type="submit" disabled={savingHealth} className="mt-6 w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 transition disabled:opacity-50">
            <Shield size={14} /> {savingHealth ? 'Updating...' : 'Save Health Profile'}
          </button>
        </motion.form>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 px-5 py-4 bg-amber-50 dark:bg-amber-900/15 rounded-xl border border-amber-200/50 dark:border-amber-800/30 text-center">
        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">⚕️ Your health data is used solely for generating personalized AI-powered insights. This is not a substitute for professional medical advice.</p>
      </div>
    </div>
  );
};

export default Profile;
