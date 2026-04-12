import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, LogIn, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import FloatingInput from '../components/ui/FloatingInput';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      });

      login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex justify-center items-center py-12" id="login-page">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel w-full max-w-md p-8 md:p-10 rounded-2xl relative overflow-hidden"
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-indigo-500 to-violet-500" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-5 shadow-xl shadow-primary-500/20">
            <HeartPulse size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Welcome Back</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Sign in to manage your medications safely</p>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <FloatingInput
            id="login-username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <FloatingInput
            id="login-password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 hover:opacity-90 text-white dark:text-slate-900 rounded-xl py-3.5 font-bold flex justify-center items-center gap-2 transition-all shadow-lg mt-3 text-sm"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" /> : <LogIn size={18} />}
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-bold">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
