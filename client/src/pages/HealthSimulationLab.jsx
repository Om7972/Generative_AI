import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Play, RotateCcw, Save, Zap, AlertTriangle, 
  UserCircle, Plus
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { SimulationGraph, ScenarioEditor } from '../components/ui';
import toast from 'react-hot-toast';

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
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30">
              <Activity size={24} className="text-white" />
            </div>
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
          <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                Scenario Editor
              </h3>
              <button 
                onClick={addMedicationToScenario}
                className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 p-1.5 rounded-lg transition"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <ScenarioEditor 
              scenarioMeds={scenarioMeds} 
              setScenarioMeds={setScenarioMeds} 
            />

            <div className="mt-5 space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
              <button
                onClick={() => runSimulation(false)}
                disabled={loading || scenarioMeds.length === 0}
                className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? <Activity className="animate-spin" size={16} /> : <Play size={16} />}
                {loading ? 'Simulating...' : 'Run Simulation'}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={resetScenario}
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <RotateCcw size={14} /> Reset
                </button>
                <button
                  onClick={() => {
                    setCompareMode(!compareMode);
                    if (!compareMode && !baselineData && scenarioMeds.length > 0) {
                      runSimulation(true); // run initial as baseline
                    }
                  }}
                  className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-xs transition border ${
                    compareMode 
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' 
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Save size={14} /> Compare Mode
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10">
            <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-400 mb-2 uppercase tracking-widest flex items-center gap-1.5">
              <UserCircle size={14} /> Digital Twin Accuracy
            </h4>
            <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 font-medium leading-relaxed">
              This simulation incorporates your baseline health profile, including age and reported conditions, combined with live AI pharmaco-kinetic modeling.
            </p>
          </div>
        </div>

        {/* Right Side: Graph area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 min-h-[500px]">
             <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-lg">
                 24-Hour Outcome Timeline
               </h3>
               {simulationData && (
                 <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg uppercase tracking-widest animate-pulse">
                   Live Simulation
                 </span>
               )}
             </div>

             {!simulationData ? (
               <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                 <Activity size={48} className="mb-4 opacity-50" />
                 <p className="font-bold text-sm">No active simulation.</p>
                 <p className="text-xs font-medium mt-1">Adjust scenario on the left and run simulation to view results.</p>
               </div>
             ) : (
               <>
                 <SimulationGraph data={simulationData} />
                 
                 {compareMode && baselineData && (
                   <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                     <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-4 opacity-70">
                       Baseline (Previous State)
                     </h3>
                     <div className="opacity-70 scale-[0.98] origin-top">
                       <SimulationGraph data={baselineData} />
                     </div>
                   </div>
                 )}
               </>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthSimulationLab;
