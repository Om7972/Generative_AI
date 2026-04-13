import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanFace, FileText, CheckCircle2, ChevronRight, Save } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ReportUploader, ExtractedDataCard, SummaryView } from '../components/ui';
import toast from 'react-hot-toast';

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
      setScannedReport(null); // Clear form after
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30">
              <ScanFace size={24} className="text-white" />
            </div>
            AI Document Scanner
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm">
            Drag and drop your prescriptions, hospital discharge reports, or handwritten notes, and let AI structure it automatically.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Step 1: Upload */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <ReportUploader onUpload={handleUpload} loading={loading} />
        </div>

        {/* Step 2: Extract & Edit & Confirm */}
        <AnimatePresence>
          {scannedReport && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <SummaryView aiSummary={scannedReport.aiSummary} />
              
              <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <ExtractedDataCard 
                  extractedMeds={extractedMeds} 
                  setExtractedMeds={setExtractedMeds} 
                />

                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
                  <button 
                    onClick={handleSaveMedications}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40"
                  >
                    <Save size={18} />
                    Confirm & Save to Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
};

export default ReportScanner;
