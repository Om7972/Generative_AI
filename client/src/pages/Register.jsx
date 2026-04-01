import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

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
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex justify-center items-center py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md p-8 md:p-10 rounded-3xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100/50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4 shadow-sm border border-primary-200/50 dark:border-primary-800/50">
            <HeartPulse size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Join MediGuide AI to manage your health</p>
        </div>

        {error && (
           <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium">
             {error}
           </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:text-white"
              placeholder="Pick a unique username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:text-white"
              placeholder="Create a strong password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:text-white"
              placeholder="Retype your password"
              required
            />
          </div>

          <motion.button 
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3.5 font-semibold flex justify-center items-center gap-2 transition-all shadow-lg shadow-slate-900/20 mt-8" 
            disabled={loading}
          >
            {loading ? <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div> : <UserPlus size={20} />}
            {loading ? 'Processing...' : 'Create Account'}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700">Sign in here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
