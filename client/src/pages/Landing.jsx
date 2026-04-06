import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Shield, Brain, Calendar, MessageSquare, Activity, ArrowRight, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

const Landing = () => {
  const { user } = useAuth();
  
  const features = [
    { icon: Brain, title: 'AI Risk Analysis', desc: 'Get instant drug interaction detection and risk scoring powered by OpenAI.', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { icon: Calendar, title: 'Calendar View', desc: 'Visualize your medication schedule in a beautiful weekly calendar.', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: MessageSquare, title: 'AI Chat Assistant', desc: 'Ask questions like "Can I take these together?" and get instant answers.', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { icon: Shield, title: 'Safety Warnings', desc: 'Receive critical alerts about dangerous combinations and contraindications.', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { icon: Clock, title: 'Smart Reminders', desc: 'Browser notifications and email reminders so you never miss a dose.', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { icon: Activity, title: 'History Tracking', desc: 'Every AI report is saved. Review past analyses anytime in your dashboard.', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  const stats = [
    { label: 'Medications Tracked', value: '10K+' },
    { label: 'Risk Checks Run', value: '50K+' },
    { label: 'Active Users', value: '2.5K+' },
    { label: 'Uptime', value: '99.9%' },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full bg-primary-400/15 dark:bg-primary-600/10 blur-[120px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[50%] h-[50%] rounded-full bg-indigo-400/15 dark:bg-indigo-600/8 blur-[140px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-violet-400/10 dark:bg-violet-600/5 blur-[100px]" />
        </div>

        <div className="container mx-auto max-w-5xl text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-200 dark:border-primary-800/50 bg-primary-50/80 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-sm font-semibold mb-8 backdrop-blur-sm"
          >
            <Zap size={14} className="animate-pulse" /> AI-Powered Medication Safety
          </motion.div>

          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6"
          >
            Your Medications,{' '}
            <span className="bg-gradient-to-r from-primary-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Intelligently Safe
            </span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            MediGuide AI analyzes your prescriptions for dangerous interactions, generates personalized dosage reminders, and provides real-time safety guidance — all powered by artificial intelligence.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {user ? (
              <Link to="/dashboard"
                className="group px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-all flex items-center gap-3"
              >
                Go to Dashboard
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link to="/register"
                  className="group px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-all flex items-center gap-3"
                >
                  Get Started Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login"
                  className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl font-bold text-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((s, i) => (
              <div key={i} className="glass-panel rounded-2xl p-5 text-center">
                <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{s.value}</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} custom={0}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Everything You Need for Safe Medication Management
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} custom={i}
                className="glass-card rounded-3xl p-7 hover:scale-[1.02] transition-transform cursor-default group"
              >
                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon size={24} className={f.color} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-4 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Three Steps to Safer Medication
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Add Your Medications', desc: 'Enter your prescriptions with dosage, frequency, and timing. The system prevents duplicates automatically.' },
              { step: '02', title: 'Set Your Profile', desc: 'Provide your age, conditions, and allergies so the AI can personalize its analysis.' },
              { step: '03', title: 'Get AI Analysis', desc: 'Click "Analyze" and receive instant risk scoring, interaction warnings, and optimized timing suggestions.' },
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="flex gap-6 items-start glass-card rounded-2xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary-500/20">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="container mx-auto max-w-3xl text-center glass-panel rounded-3xl p-12 md:p-16 relative overflow-hidden"
        >
          <div className="pointer-events-none absolute -top-1/2 -right-1/4 w-[50%] h-[80%] rounded-full bg-primary-400/10 blur-[100px]" />
          <div className="relative z-10">
            <CheckCircle2 size={48} className="mx-auto text-primary-600 dark:text-primary-400 mb-6" />
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Ready to Manage Your Health Smarter?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of patients who trust MediGuide AI to keep their medication routine safe and optimized.
            </p>
            {user ? (
              <Link to="/dashboard"
                className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:opacity-90 shadow-xl transition-all"
              >
                Go to Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <Link to="/register"
                className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:opacity-90 shadow-xl transition-all"
              >
                Create Your Free Account <ArrowRight size={20} />
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
            <HeartPulse size={20} className="text-primary-600" />
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
