import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconGradient?: string;
  subtitle?: string;
  accent?: string;
}

const defaultGradients = [
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-500',
];

export default function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconGradient = 'from-blue-500 to-blue-600',
  subtitle,
  accent,
}: StatCardProps) {
  const changeColor =
    changeType === 'up' ? 'text-emerald-600 bg-emerald-50' :
    changeType === 'down' ? 'text-red-500 bg-red-50' :
    'text-slate-500 bg-slate-100';
  const changePrefix = changeType === 'up' ? '↑ ' : changeType === 'down' ? '↓ ' : '';

  return (
    <div className="stat-card bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/60 p-5 overflow-hidden relative">
      {/* Subtle top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${iconGradient} opacity-60`} />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg`}
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <Icon size={20} className="text-white" />
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${changeColor}`}>
            {changePrefix}{change}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1.5 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
}
