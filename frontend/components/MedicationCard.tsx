import React from 'react';
import { Pill, Clock, Box, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Schedule } from '../types';

interface MedicationCardProps {
  schedule?: Schedule | null;
  isDueNow?: boolean;
}

export function MedicationCard({ schedule, isDueNow = false }: MedicationCardProps) {
  if (!schedule) {
    return (
      <div className="p-6 rounded-2xl glass-panel text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400 mb-3">
          <Pill className="w-6 h-6" />
        </div>
        <h4 className="text-base font-medium text-white">No Upcoming Doses Scheduled</h4>
        <p className="text-xs text-slate-400 mt-1">All medication intake windows for today have passed.</p>
      </div>
    );
  }

  const medicineName = schedule.medicine?.name || 'Scheduled Medicine';

  return (
    <div
      className={`p-6 rounded-2xl glass-panel relative overflow-hidden transition-all ${
        isDueNow
          ? 'border-amber-500/50 shadow-lg shadow-amber-500/10 bg-gradient-to-r from-amber-950/20 via-slate-900/80 to-slate-900/80'
          : 'border-slate-800/80'
      }`}
    >
      {isDueNow && (
        <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase flex items-center gap-1.5 animate-pulse">
          <AlertCircle className="w-3 h-3" />
          MEDICINE DUE NOW
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-950/60 text-violet-300 border border-violet-800/50 uppercase tracking-wider mb-2">
            Next Dose
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">{medicineName}</h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-cyan-400">
              <Clock className="w-3.5 h-3.5" />
              {schedule.startTime} &mdash; {schedule.endTime}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-purple-300">
              <Box className="w-3.5 h-3.5 text-violet-400" />
              BOX {schedule.boxNumber}
            </span>
          </p>
        </div>

        <div className="hidden sm:flex flex-col items-end">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 to-cyan-500/30 border border-violet-500/30 flex items-center justify-center text-cyan-400">
            <Pill className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Instructions: <span className="text-slate-400">{schedule.medicine?.instructions || 'Take with water'}</span>
        </div>

        {isDueNow && (
          <div className="px-4 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/40 flex items-center gap-1.5">
            Open Box {schedule.boxNumber}
          </div>
        )}
      </div>
    </div>
  );
}
