import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import FloatingInput from '../components/ui/FloatingInput';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        password,
      });

      login(data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex justify-center items-center py-12" id="register-page">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel w-full max-w-md p-8 md:p-10 rounded-2xl relative overflow-hidden"
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 via-primary-500 to-violet-500" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-500 text-white mb-5 shadow-xl shadow-primary-500/20">
            <HeartPulse size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Create Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Join MediGuide AI to manage your health</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 border border-danger-100 dark:border-danger-800/50 rounded-xl text-sm font-semibold"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            id="register-username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <FloatingInput
            id="register-password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <FloatingInput
            id="register-confirm-password"
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 hover:opacity-90 text-white dark:text-slate-900 rounded-xl py-3.5 font-bold flex justify-center items-center gap-2 transition-all shadow-lg mt-3 text-sm"
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" /> : <UserPlus size={18} />}
            {loading ? 'Processing...' : 'Create Account'}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-bold">Sign in here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
