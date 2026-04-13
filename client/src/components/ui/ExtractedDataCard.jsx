import React from 'react';
import { Pill, Clock, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ExtractedDataCard = ({ extractedMeds, setExtractedMeds }) => {
  
  if (!extractedMeds || extractedMeds.length === 0) return null;

  const handleEdit = (index, field, value) => {
    const updated = [...extractedMeds];
    updated[index] = { ...updated[index], [field]: value };
    setExtractedMeds(updated);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
          <Pill size={16} />
        </div>
        Detected Medications
      </h3>
      
      {extractedMeds.map((med, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/80"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Medication Name</label>
              <input
                type="text"
                value={med.name}
                onChange={(e) => handleEdit(index, 'name', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-bold focus:border-primary-500 focus:outline-none transition"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Dosage</label>
              <input
                type="text"
                value={med.dosage}
                onChange={(e) => handleEdit(index, 'dosage', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-bold focus:border-primary-500 focus:outline-none transition"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Frequency</label>
              <select
                value={med.frequency}
                onChange={(e) => handleEdit(index, 'frequency', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-bold focus:border-primary-500 focus:outline-none transition"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
                <option value={med.frequency}>{med.frequency}</option>
              </select>
            </div>
            
            <div className="space-y-1 relative">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Time (Optional)</label>
              <input
                type="text"
                value={med.timeOfIntake || ''}
                onChange={(e) => handleEdit(index, 'timeOfIntake', e.target.value)}
                placeholder="08:00 AM"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-bold focus:border-primary-500 focus:outline-none transition"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Instructions / Notes</label>
              <input
                type="text"
                value={med.instructions}
                onChange={(e) => handleEdit(index, 'instructions', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-600 dark:text-slate-400 font-medium focus:border-primary-500 focus:outline-none transition"
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ExtractedDataCard;
