'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Box, AlertTriangle } from 'lucide-react';
import { Medicine, Schedule } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  medicines: Medicine[];
  initialData?: Schedule | null;
}

export function ScheduleModal({
  isOpen,
  onClose,
  onSave,
  medicines,
  initialData,
}: ScheduleModalProps) {
  const [medicineId, setMedicineId] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('09:00');
  const [boxNumber, setBoxNumber] = useState<number>(1);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setMedicineId(initialData.medicineId);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setBoxNumber(initialData.boxNumber);
      setEnabled(initialData.enabled);
    } else {
      if (medicines.length > 0) {
        setMedicineId(medicines[0].id);
        setBoxNumber(medicines[0].boxNumber);
      }
      setStartTime('08:00');
      setEndTime('09:00');
      setEnabled(true);
    }
    setError('');
  }, [initialData, medicines, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!medicineId) {
      setError('Please select a medicine.');
      return;
    }

    if (!startTime || !endTime) {
      setError('Start time and End time are required.');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be after start time.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        medicineId,
        startTime,
        endTime,
        boxNumber: Number(boxNumber),
        enabled,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save schedule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMedicineChange = (medId: string) => {
    setMedicineId(medId);
    const found = medicines.find((m) => m.id === medId);
    if (found) {
      setBoxNumber(found.boxNumber);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0B0F17] border border-slate-800 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-400" />
            {initialData ? 'Edit Medication Schedule' : 'Create New Schedule'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Medicine Selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Select Medicine</label>
            <select
              value={medicineId}
              onChange={(e) => handleMedicineChange(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-violet-500"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (Default Box {m.boxNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Time Window */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          {/* Box Selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1">
              <Box className="w-3.5 h-3.5 text-violet-400" />
              Target Hardware Box
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBoxNumber(1)}
                className={`p-3 rounded-xl border font-bold text-center transition-all ${
                  boxNumber === 1
                    ? 'bg-violet-950/60 border-violet-500 text-violet-300 shadow-md shadow-violet-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                BOX 1 (GPIO 13)
              </button>
              <button
                type="button"
                onClick={() => setBoxNumber(2)}
                className={`p-3 rounded-xl border font-bold text-center transition-all ${
                  boxNumber === 2
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                BOX 2 (GPIO 4)
              </button>
            </div>
          </div>

          {/* Enabled Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="enabled" className="text-slate-300 font-medium cursor-pointer">
              Schedule Active (Sync to ESP32)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Schedule' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
