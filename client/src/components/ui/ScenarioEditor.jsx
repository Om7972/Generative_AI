import React from 'react';
import { motion } from 'framer-motion';
import { Pill, Clock, Edit3, Trash2 } from 'lucide-react';

const ScenarioEditor = ({ scenarioMeds, setScenarioMeds }) => {

  const updateMed = (index, field, value) => {
    const updated = [...scenarioMeds];
    updated[index] = { ...updated[index], [field]: value };
    setScenarioMeds(updated);
  };

  const removeMed = (index) => {
    setScenarioMeds(scenarioMeds.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
      {scenarioMeds.map((med, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative group"
        >
          <button 
            onClick={() => removeMed(index)}
            className="absolute top-3 right-3 text-slate-400 hover:text-danger-500 opacity-0 group-hover:opacity-100 transition"
          >
            <Trash2 size={14} />
          </button>
          
          <div className="flex items-center gap-2 mb-3 pr-6">
            <Pill size={16} className="text-primary-500" />
            <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{med.name}</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Dosage Slider/Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Edit3 size={10} /> Dosage (mg)
              </label>
              <input
                type="text"
                value={med.dosage}
                onChange={(e) => updateMed(index, 'dosage', e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
                placeholder="e.g. 10mg"
              />
            </div>

            {/* Time Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Clock size={10} /> Time
              </label>
              <input
                type="time"
                value={med.timeOfIntake.replace(/ A| P|a|p|m|M/g, '').trim()} // Simplified mapping from 08:00 AM to valid time
                onChange={(e) => updateMed(index, 'timeOfIntake', e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
              />
            </div>
          </div>
        </motion.div>
      ))}

      {scenarioMeds.length === 0 && (
        <div className="text-center py-6 text-slate-500 text-sm italic border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
          No medications to simulate.
        </div>
      )}
    </div>
  );
};

export default ScenarioEditor;
