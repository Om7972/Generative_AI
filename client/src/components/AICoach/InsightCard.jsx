import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

const InsightCard = ({ type, text }) => {
  const getIcon = () => {
    switch (type) {
      case 'tip': return <Lightbulb className="text-yellow-400" size={18} />;
      case 'trend': return <TrendingUp className="text-green-400" size={18} />;
      case 'warning': return <AlertCircle className="text-red-400" size={18} />;
      default: return <Lightbulb className="text-blue-400" size={18} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'tip': return 'bg-yellow-400/10 border-yellow-400/20 text-yellow-100';
      case 'trend': return 'bg-green-400/10 border-green-400/20 text-green-100';
      case 'warning': return 'bg-red-400/10 border-red-400/20 text-red-100';
      default: return 'bg-blue-400/10 border-blue-400/20 text-blue-100';
    }
  };

  return (
    <div className={`flex gap-3 p-3 rounded-2xl border ${getColors()}`}>
      <div className="mt-0.5">{getIcon()}</div>
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
};

export default InsightCard;
