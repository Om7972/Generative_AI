import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ReportUploader = ({ onUpload, loading }) => {
  const [file, setFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const handleUploadClick = () => {
    if (file) {
      onUpload(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1
  });

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors duration-200 ease-in-out ${
          isDragActive 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : file 
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10'
              : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          {file ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                <CheckCircle size={32} />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{file.name}</p>
              <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </motion.div>
          ) : (
            <>
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary-500 mb-2">
                <UploadCloud size={32} />
              </div>
              <div>
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                  Drag & drop your medical report here
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Supports PDF, PNG, JPG forms.
                </p>
              </div>
              <div className="flex gap-4 mt-4 opacity-50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 select-none"><FileText size={14}/> PDF</div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 select-none"><ImageIcon size={14}/> Images</div>
              </div>
            </>
          )}
        </div>
      </div>

      {file && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleUploadClick}
          disabled={loading}
          className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Scanning report via AI...
            </>
          ) : (
            'Scan & Extract Data'
          )}
        </motion.button>
      )}
    </div>
  );
};

export default ReportUploader;
