import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Shield, Brain, Calendar, MessageSquare, Activity, ArrowRight, Zap, Clock, CheckCircle2, Sparkles, Star, TrendingUp } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

/* ── Animated reveal wrapper ── */
const Reveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const dirMap = {
    up: { initial: { opacity: 0, y: 40, filter: 'blur(6px)' }, animate: { opacity: 1, y: 0, filter: 'blur(0px)' } },
    down: { initial: { opacity: 0, y: -40, filter: 'blur(6px)' }, animate: { opacity: 1, y: 0, filter: 'blur(0px)' } },
    left: { initial: { opacity: 0, x: 40, filter: 'blur(6px)' }, animate: { opacity: 1, x: 0, filter: 'blur(0px)' } },
    right: { initial: { opacity: 0, x: -40, filter: 'blur(6px)' }, animate: { opacity: 1, x: 0, filter: 'blur(0px)' } },
    scale: { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 } },
  };

  return (
    <motion.div
      ref={ref}
      initial={dirMap[direction].initial}
      animate={isInView ? dirMap[direction].animate : dirMap[direction].initial}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ── Animated particle dots ── */
const ParticleField = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-primary-400/20 dark:bg-primary-400/10"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.2, 0.6, 0.2],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 3 + Math.random() * 4,
          delay: Math.random() * 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

const Landing = () => {
  const { user } = useAuth();

  const features = [
    { icon: Brain, title: 'AI Risk Analysis', desc: 'Get instant drug interaction detection and risk scoring powered by OpenAI.', gradient: 'from-violet-500 to-purple-600' },
    { icon: Calendar, title: 'Calendar View', desc: 'Visualize your medication schedule in a beautiful weekly calendar.', gradient: 'from-blue-500 to-cyan-500' },
    { icon: MessageSquare, title: 'AI Chat Assistant', desc: 'Ask questions like "Can I take these together?" and get instant answers.', gradient: 'from-emerald-500 to-teal-500' },
    { icon: Shield, title: 'Safety Warnings', desc: 'Receive critical alerts about dangerous combinations and contraindications.', gradient: 'from-rose-500 to-pink-500' },
    { icon: Clock, title: 'Smart Reminders', desc: 'Browser notifications and email reminders so you never miss a dose.', gradient: 'from-amber-500 to-orange-500' },
    { icon: Activity, title: 'History Tracking', desc: 'Every AI report is saved. Review past analyses anytime in your dashboard.', gradient: 'from-indigo-500 to-blue-500' },
  ];

  const stats = [
    { label: 'Medications Tracked', value: '10K+', icon: TrendingUp },
    { label: 'Risk Checks Run', value: '50K+', icon: Shield },
    { label: 'Active Users', value: '2.5K+', icon: Star },
    { label: 'Uptime', value: '99.9%', icon: Zap },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-[95vh] flex items-center justify-center px-4" id="hero-section">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
          {/* Aurora animated background */}
          <div className="absolute inset-0 bg-aurora opacity-60" />

          {/* Morphing blob */}
          <motion.div
            className="absolute -top-1/4 -left-1/6 w-[50%] h-[50%] bg-gradient-to-r from-primary-400/12 to-violet-400/8 dark:from-primary-600/6 dark:to-violet-600/4 animate-morph-blob"
          />
          <motion.div
            className="absolute -bottom-1/4 -right-1/6 w-[45%] h-[45%] bg-gradient-to-l from-blue-400/10 to-cyan-400/6 dark:from-blue-600/5 dark:to-cyan-600/3 animate-morph-blob"
            style={{ animationDelay: '-4s' }}
          />

          {/* Dot grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.04) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />

          {/* Particle field */}
          <ParticleField />
        </div>

        <div className="container mx-auto max-w-5xl text-center">
          <Reveal delay={0}>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary-200/60 dark:border-primary-800/40 bg-primary-50/80 dark:bg-primary-900/15 text-primary-700 dark:text-primary-400 text-sm font-bold mb-8 backdrop-blur-sm shadow-sm">
              <Sparkles size={14} className="animate-pulse" /> AI-Powered Medication Safety
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05] mb-6"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Your Medications,{' '}
              <span className="text-gradient-primary">
                Intelligently Safe
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              MediGuide AI analyzes your prescriptions for dangerous interactions, generates personalized dosage reminders, and provides real-time safety guidance — all powered by artificial intelligence.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Link to="/dashboard"
                  className="group px-8 py-4 bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-500 hover:from-primary-700 hover:via-primary-600 hover:to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-all flex items-center gap-3 hover-lift btn-ripple"
                  id="hero-cta-dashboard"
                >
                  Go to Dashboard
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
              ) : (
                <>
                  <Link to="/register"
                    className="group px-8 py-4 bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-500 hover:from-primary-700 hover:via-primary-600 hover:to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-all flex items-center gap-3 hover-lift btn-ripple"
                    id="hero-cta-signup"
                  >
                    Get Started Free
                    <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                  </Link>
                  <Link to="/login"
                    className="px-8 py-4 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl font-bold text-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg backdrop-blur-sm transition-all hover-lift"
                    id="hero-cta-signin"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </Reveal>

          {/* Stats with hover-lift */}
          <Reveal delay={0.4}>
            <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -6, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="glass-panel rounded-2xl p-5 text-center cursor-default card-3d"
                >
                  <s.icon size={18} className="mx-auto text-primary-500 dark:text-primary-400 mb-2" />
                  <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{s.value}</div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 border-2 border-slate-300 dark:border-slate-600 rounded-full flex justify-center pt-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-28 px-4 relative" id="features-section">
        <div className="container mx-auto max-w-6xl">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/15 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest mb-4 border border-primary-200/50 dark:border-primary-800/40">
                <Sparkles size={12} /> Features
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Everything You Need for{' '}
                <span className="text-gradient-primary">Safe Medication</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 0.08} direction={i % 2 === 0 ? 'up' : 'right'}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="glass-card rounded-2xl p-7 cursor-default group relative overflow-hidden card-3d h-full"
                >
                  {/* Gradient accent strip with hover */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  {/* Hover glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                  <div className={`w-12 h-12 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <f.icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-28 px-4 bg-slate-50/50 dark:bg-slate-900/30 relative" id="how-it-works">
        <div className="container mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-50 dark:bg-accent-900/15 text-accent-600 dark:text-accent-400 text-xs font-bold uppercase tracking-widest mb-4 border border-accent-200/50 dark:border-accent-800/40">
                <Zap size={12} /> How It Works
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Three Steps to{' '}
                <span className="text-gradient-accent">Safer Medication</span>
              </h2>
            </div>
          </Reveal>

          <div className="space-y-6">
            {[
              { step: '01', title: 'Add Your Medications', desc: 'Enter your prescriptions with dosage, frequency, and timing. The system prevents duplicates automatically.', gradient: 'from-primary-500 to-indigo-500' },
              { step: '02', title: 'Set Your Profile', desc: 'Provide your age, conditions, and allergies so the AI can personalize its analysis.', gradient: 'from-violet-500 to-purple-500' },
              { step: '03', title: 'Get AI Analysis', desc: 'Click "Analyze" and receive instant risk scoring, interaction warnings, and optimized timing suggestions.', gradient: 'from-accent-500 to-teal-500' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.1} direction="left">
                <motion.div
                  whileHover={{ x: 8, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="flex gap-6 items-start glass-card rounded-2xl p-6 group"
                >
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-4" id="cta-section">
        <Reveal direction="scale">
          <div className="container mx-auto max-w-3xl text-center glass-panel rounded-3xl p-12 md:p-16 relative overflow-hidden">
            {/* Background blobs */}
            <div className="pointer-events-none absolute -top-1/2 -right-1/4 w-[50%] h-[80%] rounded-full bg-primary-400/8 blur-[120px] animate-float" />
            <div className="pointer-events-none absolute -bottom-1/4 -left-1/4 w-[40%] h-[60%] rounded-full bg-violet-400/6 blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />

            <div className="relative z-10">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/20"
              >
                <CheckCircle2 size={32} className="text-white" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Ready to Manage Your Health Smarter?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-10 max-w-xl mx-auto leading-relaxed">
                Join thousands of patients who trust MediGuide AI to keep their medication routine safe and optimized.
              </p>
              {user ? (
                <Link to="/dashboard"
                  className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:opacity-90 shadow-xl transition-all hover-lift btn-ripple"
                >
                  Go to Dashboard <ArrowRight size={20} />
                </Link>
              ) : (
                <Link to="/register"
                  className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:opacity-90 shadow-xl transition-all hover-lift btn-ripple"
                >
                  Create Your Free Account <ArrowRight size={20} />
                </Link>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 py-10 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5 font-black text-slate-800 dark:text-white">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="p-1.5 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl shadow-sm"
            >
              <HeartPulse size={18} />
            </motion.div>
            MediGuide AI
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            © 2026 MediGuide AI. Built with care for patient safety.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
