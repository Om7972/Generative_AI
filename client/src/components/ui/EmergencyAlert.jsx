import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Phone, X, AlertTriangle, HeartPulse } from 'lucide-react';

const EmergencyAlert = ({ alert, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    const unlock = () => {
      setAudioUnlocked(true);
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  useEffect(() => {
    if (alert && audioUnlocked) {
      setVisible(true);
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
        setTimeout(() => ctx.close(), 600);
      } catch (e) {}
    } else if (alert) {
      setVisible(true);
    }
  }, [alert, audioUnlocked]);

  if (!alert || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      >
        {/* Red pulsing backdrop */}
        <div className="absolute inset-0 bg-danger-900/90 backdrop-blur-md animate-pulse" style={{ animationDuration: '2s' }} />

        <motion.div
          initial={{ scale: 0.8, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border-2 border-danger-500/50"
        >
          {/* Top danger stripe */}
          <div className="h-2 bg-gradient-to-r from-red-600 via-danger-500 to-red-600 animate-pulse" />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className="relative inline-flex mb-6">
              <div className="w-24 h-24 rounded-full bg-danger-50 dark:bg-danger-900/30 flex items-center justify-center">
                <ShieldAlert size={48} className="text-danger-600 dark:text-danger-400" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-danger-400/50 animate-ping" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black text-danger-700 dark:text-danger-400 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
              🚨 EMERGENCY ALERT
            </h2>

            <p className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              {alert.title || "Critical Health Risk Detected"}
            </p>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed font-medium max-w-sm mx-auto">
              {alert.message || "A severe drug interaction has been detected in your medication regimen."}
            </p>

            {/* Action cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="bg-danger-50 dark:bg-danger-900/20 p-4 rounded-2xl border border-danger-200 dark:border-danger-800/50 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Phone size={14} className="text-danger-600 dark:text-danger-400" />
                  <span className="text-xs font-bold text-danger-700 dark:text-danger-400 uppercase tracking-wider">Call Doctor</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Contact your healthcare provider immediately about this interaction.</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/15 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/50 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Stop Medication</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Do NOT take the flagged medications until cleared by your doctor.</p>
              </div>
            </div>

            {/* Emergency number */}
            <a
              href="tel:911"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-danger-600 to-red-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-danger-500/25 mb-4 hover:opacity-90 transition"
            >
              <Phone size={16} /> Call Emergency Services
            </a>

            {/* Dismiss */}
            <div>
              <button
                onClick={() => { setVisible(false); onDismiss?.(); }}
                className="text-xs text-slate-500 dark:text-slate-400 font-semibold hover:text-slate-700 dark:hover:text-slate-300 transition mt-2 flex items-center gap-1 mx-auto"
              >
                <X size={12} /> I understand, dismiss this alert
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmergencyAlert;
