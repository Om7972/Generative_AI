import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanFace, FileText, CheckCircle2, ChevronRight, Save, Sparkles, Upload } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ReportUploader, ExtractedDataCard, SummaryView } from '../components/ui';
import toast from 'react-hot-toast';

/* ── Scanner Loader ── */
const ScannerLoader = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-20 gap-6"
  >
    {/* Pulsing scanner ring */}
    <div className="relative w-24 h-24">
      <motion.div
        className="absolute inset-0 border-4 border-primary-200 dark:border-primary-800/40 rounded-full"
      />
      <motion.div
        className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-3 border-4 border-indigo-400/50 rounded-full border-b-transparent"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
      />
      {/* Center icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ScanFace size={28} className="text-primary-500" />
      </motion.div>
    </div>

    {/* Scanning text with shimmer */}
    <div className="text-center">
      <motion.h3
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-lg font-bold text-slate-800 dark:text-white mb-1"
      >
        Analyzing Document...
      </motion.h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
        AI is extracting medication data
      </p>
    </div>

    {/* Progress dots */}
    <div className="loader-pulse-dots">
      <span /><span /><span />
    </div>
  </motion.div>
);

const ReportScanner = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scannedReport, setScannedReport] = useState(null);
  const [extractedMeds, setExtractedMeds] = useState([]);

  const handleUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('report', file);

    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/scan-report', formData, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setScannedReport(data);
      setExtractedMeds(data.extractedData?.medications || []);
      toast.success('Successfully analyzed medical document!');
    } catch(err) {
      toast.error(err.response?.data?.message || 'Verification Error. Could not process report.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedications = async () => {
    try {
      for (const med of extractedMeds) {
        await axios.post('http://localhost:5000/api/medications', med, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
      toast.success('Medications added correctly!');
      setScannedReport(null);
      setExtractedMeds([]);
    } catch (err) {
      toast.error('Failed saving medications.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl flex flex-col mx-auto space-y-6"
    >
      {/* Header with animated icon */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30"
            >
              <ScanFace size={24} className="text-white" />
            </motion.div>
            AI Document Scanner
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm">
            Drag and drop your prescriptions, hospital discharge reports, or handwritten notes, and let AI structure it automatically.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Step 1: Upload with hover-lift */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
        >
          {loading ? (
            <ScannerLoader />
          ) : (
            <ReportUploader onUpload={handleUpload} loading={loading} />
          )}
        </motion.div>

        {/* Step 2: Extract & Edit & Confirm */}
        <AnimatePresence>
          {scannedReport && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <SummaryView aiSummary={scannedReport.aiSummary} />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
              >
                <ExtractedDataCard 
                  extractedMeds={extractedMeds} 
                  setExtractedMeds={setExtractedMeds} 
                />

                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
                  <motion.button
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSaveMedications}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 btn-ripple"
                  >
                    <Save size={18} />
                    Confirm & Save to Dashboard
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ReportScanner;
