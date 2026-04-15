import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/90 backdrop-blur border border-slate-700/50 p-4 rounded-xl shadow-2xl text-white w-64 z-50 relative">
        <p className="text-sm font-bold text-slate-300 mb-2">{label}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-accent-400 font-bold tracking-wider uppercase">Energy</span>
            <span className="font-bold text-white">{data.energy_level}%</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-danger-400 font-bold tracking-wider uppercase">Risk Level</span>
            <span className="font-bold text-white">{data.risk_level}%</span>
          </div>
          
          {(data.side_effects && data.side_effects.length > 0) && (
            <div className="mt-3 pt-2 border-t border-slate-700/50">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block mb-1">Warnings</span>
              <ul className="text-xs text-slate-300 list-disc pl-4 space-y-1">
                {data.side_effects.map((se, i) => <li key={i}>{se}</li>)}
              </ul>
            </div>
          )}
          
          {data.notes && (
            <div className="mt-2 text-[10px] text-slate-400 font-medium italic">
              "{data.notes}"
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const SimulationGraph = ({ data = [] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-[400px] w-full mt-6 relative">
      <ResponsiveContainer width="99%" height={380}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis 
            dataKey="hour" 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
            tickMargin={12}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
            axisLine={false}
            tickLine={false}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, fill: 'rgba(0,0,0,0.05)' }} />
          
          {/* Critical Risk Area Label */}
          <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} label={{ position: 'top', value: 'High Risk Threshold', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />

          <Area 
            type="monotone" 
            dataKey="energy_level" 
            name="Energy"
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorEnergy)"
            animationDuration={1500}
            activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="risk_level" 
            name="Risk Level"
            stroke="#ef4444" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRisk)"
            animationDuration={1500}
            activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimulationGraph;
