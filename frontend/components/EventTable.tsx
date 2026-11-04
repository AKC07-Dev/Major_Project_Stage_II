import React from 'react';
import { CheckCircle2, XCircle, Clock, Box, ShieldAlert } from 'lucide-react';
import { MedicationEvent } from '../types';

interface EventTableProps {
  events: MedicationEvent[];
  isLoading?: boolean;
}

export function EventTable({ events, isLoading = false }: EventTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center glass-panel">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading medication events...</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center glass-panel">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-2">
          <Clock className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-white">No Medication Events Logged</p>
        <p className="text-xs text-slate-400 mt-1">Events will appear here when the ESP32 registers box interactions.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl glass-panel border border-slate-800/80">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
            <th className="py-3.5 px-4">Date & Time</th>
            <th className="py-3.5 px-4">Medicine</th>
            <th className="py-3.5 px-4">Box</th>
            <th className="py-3.5 px-4">Event Type</th>
            <th className="py-3.5 px-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-200">
          {events.map((event) => {
            const dateObj = new Date(event.timestamp);
            const formattedDate = dateObj.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const formattedTime = dateObj.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });

            const medicineName = event.medicine?.name || `Medicine Box ${event.boxNumber}`;

            const isTaken = event.status === 'TAKEN';
            const isMissed = event.status === 'MISSED';

            return (
              <tr key={event.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3.5 px-4 font-mono text-slate-300">
                  <div>{formattedDate}</div>
                  <div className="text-[10px] text-cyan-400 font-medium">{formattedTime}</div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-white">
                  {medicineName}
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 font-mono px-2 py-0.5 rounded bg-violet-950/40 text-violet-300 border border-violet-800/40">
                    <Box className="w-3 h-3 text-violet-400" />
                    Box {event.boxNumber}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 font-medium">
                  {event.eventType === 'MEDICINE_TAKEN' && 'Box Opened & Taken'}
                  {event.eventType === 'MEDICINE_MISSED' && 'Dose Missed Window'}
                  {event.eventType === 'MEDICINE_REMINDER' && 'Reminder Displayed'}
                  {event.eventType === 'BOX_OPENED' && 'Compartment Opened'}
                </td>
                <td className="py-3.5 px-4 text-right">
                  {isTaken && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      TAKEN
                    </span>
                  )}
                  {isMissed && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-400 border border-rose-500/40 text-[11px] font-bold">
                      <XCircle className="w-3.5 h-3.5" />
                      MISSED
                    </span>
                  )}
                  {!isTaken && !isMissed && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-400 border border-amber-500/40 text-[11px] font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      PENDING
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
