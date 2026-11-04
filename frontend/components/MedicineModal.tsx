'use client';

import React, { useState, useEffect } from 'react';
import { X, Pill, Box } from 'lucide-react';
import { Medicine } from '../types';

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: Medicine | null;
}

export function MedicineModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: MedicineModalProps) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [boxNumber, setBoxNumber] = useState<number>(1);
  const [active, setActive] = useState<boolean>(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDosage(initialData.dosage || '');
      setInstructions(initialData.instructions || '');
      setBoxNumber(initialData.boxNumber);
      setActive(initialData.active);
    } else {
      setName('');
      setDosage('');
      setInstructions('');
      setBoxNumber(1);
      setActive(true);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Medicine name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name,
        dosage,
        instructions,
        boxNumber: Number(boxNumber),
        active,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save medicine record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0B0F17] border border-slate-800 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Pill className="w-5 h-5 text-cyan-400" />
            {initialData ? 'Edit Medicine' : 'Add New Medicine'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Medicine Name</label>
            <input
              type="text"
              placeholder="e.g. Morning Medicine (BP)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Dosage</label>
            <input
              type="text"
              placeholder="e.g. 1 Tablet (10mg)"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Special Instructions</label>
            <textarea
              placeholder="e.g. Take with warm water after food"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Default Hardware Compartment</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBoxNumber(1)}
                className={`p-3 rounded-xl border font-bold text-center transition-all ${
                  boxNumber === 1
                    ? 'bg-violet-950/60 border-violet-500 text-violet-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Box 1
              </button>
              <button
                type="button"
                onClick={() => setBoxNumber(2)}
                className={`p-3 rounded-xl border font-bold text-center transition-all ${
                  boxNumber === 2
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Box 2
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-cyan-500"
            />
            <label htmlFor="active" className="text-slate-300 font-medium cursor-pointer">
              Active Prescription
            </label>
          </div>

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
              {isSubmitting ? 'Saving...' : initialData ? 'Update Medicine' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
