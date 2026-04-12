import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 3500,
        className: 'toast-custom',
        style: {
          background: '#0f172a',
          color: '#f1f5f9',
          padding: '14px 20px',
          border: '1px solid rgba(51,65,85,0.5)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#0f172a',
          },
          style: {
            border: '1px solid rgba(34,197,94,0.3)',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#0f172a',
          },
          style: {
            border: '1px solid rgba(239,68,68,0.3)',
          },
        },
      }}
    />
  );
};

export default ToastProvider;
