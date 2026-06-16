import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-600',
  subtitle,
}: StatCardProps) {
  const changeColor =
    changeType === 'up' ? 'text-emerald-600' : changeType === 'down' ? 'text-red-500' : 'text-slate-500';
  const changePrefix = changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 font-medium ${changeColor}`}>
              {changePrefix} {change}
            </p>
          )}
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
    </div>
  );
}
