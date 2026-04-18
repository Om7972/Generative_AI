import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Play, RotateCcw, Save, Zap, AlertTriangle, 
  UserCircle, Plus, Sparkles
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { SimulationGraph, ScenarioEditor } from '../components/ui';
import toast from 'react-hot-toast';

/* ── Simulation Loader ── */
const SimulationLoader = () => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="relative w-20 h-20">
      <motion.div
        className="absolute inset-0 border-4 border-primary-200 dark:border-primary-800/40 rounded-full"
      />
      <motion.div
        className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-2.5 border-4 border-violet-400/40 rounded-full border-b-transparent"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Activity size={24} className="text-primary-500" />
      </motion.div>
    </div>
    <div className="text-center">
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-sm font-bold text-slate-600 dark:text-slate-300"
      >
        Running AI Simulation...
      </motion.p>
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
        Modeling pharmacokinetic responses
      </p>
    </div>
  </div>
);

const HealthSimulationLab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState([]);
  const [scenarioMeds, setScenarioMeds] = useState([]);
  const [simulationData, setSimulationData] = useState(null);
  
  // Baseline data if we want compare mode
  const [baselineData, setBaselineData] = useState(null);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/medications', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMedications(data);
      setScenarioMeds(data.map(m => ({ 
        name: m.name, 
        dosage: m.dosage, 
        timeOfIntake: m.timeOfIntake 
      })));
    } catch(err) {
      console.error(err);
    }
  };

  const runSimulation = async (isBaseline = false) => {
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/simulate-health', {
        medications: scenarioMeds
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      if (isBaseline) {
        setBaselineData(data.hourlyPrediction);
      } else {
        setSimulationData(data.hourlyPrediction);
      }
      toast.success('Simulation generated!');
    } catch(err) {
      toast.error('Simulation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addMedicationToScenario = () => {
    setScenarioMeds([...scenarioMeds, { name: "New Medication", dosage: "10mg", timeOfIntake: "12:00" }]);
  };

  const resetScenario = () => {
    setScenarioMeds(medications.map(m => ({ 
      name: m.name, 
      dosage: m.dosage, 
      timeOfIntake: m.timeOfIntake 
    })));
    setSimulationData(null);
    setBaselineData(null);
    setCompareMode(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -15 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30"
            >
              <Activity size={24} className="text-white" />
            </motion.div>
            Digital Twin Laboratory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm">
            Simulate how dosage and timing changes affect your body's energy and risk levels over 24 hours.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Scenario Editor */}
        <div className="lg:col-span-1 space-y-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                Scenario Editor
              </h3>
              <motion.button
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.85 }}
                onClick={addMedicationToScenario}
                className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 p-1.5 rounded-lg transition"
              >
                <Plus size={16} />
              </motion.button>
            </div>
            
            <ScenarioEditor 
              scenarioMeds={scenarioMeds} 
              setScenarioMeds={setScenarioMeds} 
            />

            <div className="mt-5 space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => runSimulation(false)}
                disabled={loading || scenarioMeds.length === 0}
                className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50 btn-ripple shadow-lg shadow-primary-500/20"
              >
                {loading ? <SimulationLoader /> : (
                  <>
                    <Play size={16} />
                    Run Simulation
                  </>
                )}
              </motion.button>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetScenario}
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <RotateCcw size={14} />
                  Reset
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCompareMode(!compareMode);
                    if (!compareMode && !baselineData && scenarioMeds.length > 0) {
                      runSimulation(true);
                    }
                  }}
                  className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-xs transition border ${
                    compareMode 
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' 
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Save size={14} />
                  Compare Mode
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10"
          >
            <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-400 mb-2 uppercase tracking-widest flex items-center gap-1.5">
              <UserCircle size={14} /> Digital Twin Accuracy
            </h4>
            <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 font-medium leading-relaxed">
              This simulation incorporates your baseline health profile, including age and reported conditions, combined with live AI pharmaco-kinetic modeling.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Graph area */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 min-h-[500px]"
          >
             <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-lg">
                 24-Hour Outcome Timeline
               </h3>
               {simulationData && (
                 <motion.span
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg uppercase tracking-widest"
                 >
                   <motion.span
                     animate={{ opacity: [0.5, 1, 0.5] }}
                     transition={{ duration: 2, repeat: Infinity }}
                   >
                     ● Live Simulation
                   </motion.span>
                 </motion.span>
               )}
             </div>

             <AnimatePresence mode="wait">
               {loading ? (
                 <motion.div
                   key="loader"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                 >
                   <SimulationLoader />
                 </motion.div>
               ) : !simulationData ? (
                 <motion.div
                   key="empty"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="h-[400px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500"
                 >
                   <motion.div
                     animate={{ y: [0, -8, 0] }}
                     transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                   >
                     <Activity size={48} className="mb-4 opacity-50" />
                   </motion.div>
                   <p className="font-bold text-sm">No active simulation.</p>
                   <p className="text-xs font-medium mt-1">Adjust scenario on the left and run simulation to view results.</p>
                 </motion.div>
               ) : (
                 <motion.div
                   key="results"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                 >
                   <SimulationGraph data={simulationData} />
                   
                   {compareMode && baselineData && (
                     <motion.div
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800"
                     >
                       <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-4 opacity-70">
                         Baseline (Previous State)
                       </h3>
                       <div className="opacity-70 scale-[0.98] origin-top">
                         <SimulationGraph data={baselineData} />
                       </div>
                     </motion.div>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthSimulationLab;
