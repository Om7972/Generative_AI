import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, UserPlus, Eye, EyeOff, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import FloatingInput from '../components/ui/FloatingInput';

/* ── Animated floating orbs behind the form ── */
const FloatingOrbs = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
    <div className="bg-orb w-[320px] h-[320px] bg-primary-400 -top-20 -left-24" style={{ animationDelay: '0s' }} />
    <div className="bg-orb w-[260px] h-[260px] bg-violet-400 -bottom-16 -right-20" style={{ animationDelay: '-3s' }} />
    <div className="bg-orb w-[180px] h-[180px] bg-blue-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '-5s' }} />
  </div>
);

/* ── DNA Helix Loader ── */
const HelixLoader = () => (
  <div className="loader-helix">
    <span /><span /><span /><span /><span />
  </div>
);

/* ── Password Strength Indicator ── */
const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  const strength = getStrength();
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const colors = ['', 'bg-danger-500', 'bg-amber-500', 'bg-amber-400', 'bg-accent-500', 'bg-accent-400'];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2"
    >
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map(i => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: strength >= i ? 1 : 0.3 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
            className={`h-1 flex-1 rounded-full origin-left transition-colors duration-300 ${
              strength >= i ? colors[strength] : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${
        strength <= 2 ? 'text-danger-500' : strength <= 3 ? 'text-amber-500' : 'text-accent-500'
      }`}>
        {labels[strength]}
      </p>
    </motion.div>
  );
};

/* ── Feature Badge ── */
const FeatureBadge = ({ icon: Icon, text, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: 'spring', stiffness: 200 }}
    className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-bold text-slate-600 dark:text-slate-300"
  >
    <Icon size={12} className="text-primary-500" />
    {text}
  </motion.div>
);

/* ── Main Register Component ── */
const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  /* ── 3D tilt effect on card ── */
  useEffect(() => {
    const card = formRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        password,
      });

      setSuccess(true);
      setTimeout(() => {
        login(data);
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Success celebration animation ── */
  if (success) {
    return (
      <div className="flex-1 flex justify-center items-center py-12" id="register-page">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-white mb-6 shadow-2xl shadow-accent-500/30"
          >
            <CheckCircle2 size={48} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-black text-slate-800 dark:text-white mb-2"
          >
            Welcome to MediGuide!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-slate-500 dark:text-slate-400 font-medium"
          >
            Redirecting to your dashboard...
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="h-1 bg-gradient-to-r from-accent-500 via-primary-500 to-violet-500 rounded-full mt-4 max-w-[200px] mx-auto"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex justify-center items-center py-12 relative" id="register-page">
      <FloatingOrbs />

      <motion.div
        ref={formRef}
        initial={{ opacity: 0, y: 30, rotateX: -5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel w-full max-w-md p-8 md:p-10 rounded-2xl relative overflow-hidden"
        style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out' }}
      >
        {/* Animated top gradient accent */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 via-primary-500 to-violet-500 origin-left"
        />

        {/* Corner sparkle */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute top-4 right-4 text-primary-300 dark:text-primary-700 opacity-40"
        >
          <Sparkles size={16} />
        </motion.div>

        {/* Header with animated icon */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-500 text-white mb-5 shadow-xl shadow-primary-500/20"
          >
            <HeartPulse size={32} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-2xl font-black text-slate-800 dark:text-white tracking-tight"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Create Account
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium"
          >
            Join MediGuide AI to manage your health
          </motion.p>

          {/* Feature badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex flex-wrap justify-center gap-2 mt-4"
          >
            <FeatureBadge icon={Shield} text="Drug Safety AI" delay={0.6} />
            <FeatureBadge icon={Sparkles} text="Smart Reminders" delay={0.7} />
          </motion.div>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="mb-6 p-4 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 border border-danger-100 dark:border-danger-800/50 rounded-xl text-sm font-semibold animate-shake"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form with staggered field reveals */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          >
            <FloatingInput
              id="register-username"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="relative"
          >
            <FloatingInput
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <PasswordStrength password={password} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
            className="relative"
          >
            <FloatingInput
              id="register-confirm-password"
              type={showConfirm ? 'text' : 'password'}
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {/* Match indicator */}
            <AnimatePresence>
              {confirmPassword && password === confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute right-10 top-3.5 text-accent-500"
                >
                  <CheckCircle2 size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit button with ripple + hover lift */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="btn-ripple w-full bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 hover:shadow-xl text-white dark:text-slate-900 rounded-xl py-3.5 font-bold flex justify-center items-center gap-2 transition-all shadow-lg mt-3 text-sm"
              disabled={loading}
              id="register-submit-btn"
            >
              {loading ? (
                <HelixLoader />
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Bottom link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-sm text-slate-500 font-medium"
        >
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-bold hover-underline">
            Sign in here
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
