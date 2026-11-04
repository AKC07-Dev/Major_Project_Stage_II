import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon: LucideIcon;
  color?: 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose';
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = 'violet',
}: StatCardProps) {
  const colorStyles = {
    violet: {
      bg: 'bg-violet-950/30 border-violet-500/30 text-violet-400',
      glow: 'shadow-violet-500/10',
    },
    cyan: {
      bg: 'bg-cyan-950/30 border-cyan-500/30 text-cyan-400',
      glow: 'shadow-cyan-500/10',
    },
    emerald: {
      bg: 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400',
      glow: 'shadow-emerald-500/10',
    },
    amber: {
      bg: 'bg-amber-950/30 border-amber-500/30 text-amber-400',
      glow: 'shadow-amber-500/10',
    },
    rose: {
      bg: 'bg-rose-950/30 border-rose-500/30 text-rose-400',
      glow: 'shadow-rose-500/10',
    },
  };

  const currentStyle = colorStyles[color];

  return (
    <div className={`p-5 rounded-2xl glass-panel glass-panel-hover relative overflow-hidden ${currentStyle.glow}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className="text-xs font-semibold text-emerald-400 mt-2 flex items-center gap-1">
              <span>{trend}</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${currentStyle.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
