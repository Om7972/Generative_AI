import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

// Generate sample weekly adherence data
const generateWeeklyData = (medications = []) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({
    day,
    adherence: Math.min(100, Math.max(40, 65 + Math.round(Math.random() * 35))),
    doses: medications.length > 0 ? medications.length : Math.round(2 + Math.random() * 3),
  }));
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-sm">
      <p className="font-bold mb-1">{label}</p>
      <p className="text-accent-400 font-semibold">{payload[0].value}% adherence</p>
      <p className="text-slate-400 text-xs">{payload[0].payload.doses} doses taken</p>
    </div>
  );
};

const AdherenceChart = ({ medications = [], title = 'Medication Adherence' }) => {
  const data = generateWeeklyData(medications);
  const avg = Math.round(data.reduce((s, d) => s + d.adherence, 0) / data.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 rounded-xl">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">This week's tracking</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-accent-600 dark:text-accent-400">{avg}%</span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Average</p>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="adherenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 500, fill: '#94a3b8' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area
              type="monotone"
              dataKey="adherence"
              stroke="#22c55e"
              strokeWidth={2.5}
              fill="url(#adherenceGradient)"
              dot={{ fill: '#22c55e', r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ fill: '#22c55e', r: 6, strokeWidth: 3, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default AdherenceChart;
