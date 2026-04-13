import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MissedDoseRecovery = ({ medication, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(null);
  const [hoursLate, setHoursLate] = useState(2);

  const fetchAdvice = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/missed-dose', {
        medicationId: medication._id,
        hoursLate,
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAdvice(data);
    } catch (err) {
      toast.error('Failed to get missed dose advice');
    } finally {
      setLoading(false);
    }
  };

  const actionStyles = {
    take_now: { bg: 'bg-accent-50 dark:bg-accent-900/20', border: 'border-accent-200 dark:border-accent-800', text: 'text-accent-700 dark:text-accent-300', icon: CheckCircle, label: 'Take Now' },
    skip: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', icon: AlertTriangle, label: 'Skip This Dose' },
    adjust_next: { bg: 'bg-primary-50 dark:bg-primary-900/20', border: 'border-primary-200 dark:border-primary-800', text: 'text-primary-700 dark:text-primary-300', icon: Clock, label: 'Adjust Timing' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-lg"
    >
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
        <Clock size={16} className="text-amber-500" />
        Missed Dose: {medication.name}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
        Scheduled: {medication.timeOfIntake} | Dosage: {medication.dosage}
      </p>

      {!advice ? (
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Hours Late</label>
            <input
              type="range"
              min="1"
              max="12"
              value={hoursLate}
              onChange={(e) => setHoursLate(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
              <span>1h</span>
              <span className="text-primary-600 dark:text-primary-400 font-black text-xs">{hoursLate}h late</span>
              <span>12h</span>
            </div>
          </div>
          <button
            onClick={fetchAdvice}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            {loading ? 'Analyzing...' : 'Get AI Advice'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Action recommendation */}
          {(() => {
            const style = actionStyles[advice.action] || actionStyles.skip;
            const Icon = style.icon;
            return (
              <div className={`${style.bg} ${style.border} border rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={18} className={style.text} />
                  <span className={`text-sm font-bold ${style.text}`}>{style.label}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {advice.reasoning}
                </p>
                {advice.adjusted_timing && (
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-bold mt-2">
                    ⏰ {advice.adjusted_timing}
                  </p>
                )}
              </div>
            );
          })()}

          {/* Warnings */}
          {advice.warnings?.length > 0 && (
            <div className="space-y-1.5">
              {advice.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
                  <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => { setAdvice(null); onClose?.(); }}
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Done
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default MissedDoseRecovery;
