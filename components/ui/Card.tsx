import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  gradient?: boolean;
}

export default function Card({ children, className = '', padding = true, gradient = false }: CardProps) {
  return (
    <div className={`
      bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/60
      ${padding ? 'p-6' : ''}
      ${gradient ? 'bg-gradient-to-br from-white to-slate-50/50' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center justify-between mb-5 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-sm font-bold text-slate-800 uppercase tracking-wider ${className}`}>{children}</h3>;
}
