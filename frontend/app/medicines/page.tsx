'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { MedicineModal } from '../../components/MedicineModal';
import { fetchApi } from '../../lib/api';
import { Medicine } from '../../types';
import { Pill, Plus, Box, Edit2, Trash2, CheckCircle, FileText } from 'lucide-react';

export default function MedicinesPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const loadMedicines = async () => {
    try {
      const data = await fetchApi<{ medicines: Medicine[] }>('/medicines');
      setMedicines(data.medicines || []);
    } catch (err) {
      console.error('Failed to load medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleSaveMedicine = async (formData: any) => {
    if (editingMedicine) {
      await fetchApi(`/medicines/${editingMedicine.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
    } else {
      await fetchApi('/medicines', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
    }
    loadMedicines();
  };

  const handleDeleteMedicine = async (id: string) => {
    if (confirm('Are you sure you want to delete this medicine prescription?')) {
      await fetchApi(`/medicines/${id}`, { method: 'DELETE' });
      loadMedicines();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex text-slate-100">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Pill className="w-6 h-6 text-cyan-400" />
                Medicine Prescription Management
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Maintain patient prescription catalog, dosage, and hardware box assignments.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingMedicine(null);
                setModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 font-bold text-white text-xs hover:opacity-90 shadow-lg shadow-violet-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Prescription
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center glass-panel">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading prescriptions...</p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-2xl">
              <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Prescriptions Found</h3>
              <p className="text-xs text-slate-400 mt-1">Add your patient's prescribed medicines to link with physical box schedules.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medicines.map((med) => (
                <div key={med.id} className="p-6 rounded-2xl glass-panel relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                        <Box className="w-3.5 h-3.5 text-cyan-400" />
                        DEFAULT BOX {med.boxNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        med.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {med.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{med.name}</h3>
                    {med.dosage && (
                      <p className="text-xs font-semibold text-slate-300 mt-1">Dosage: {med.dosage}</p>
                    )}

                    {med.instructions && (
                      <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400 flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                        <span>{med.instructions}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingMedicine(med);
                        setModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedicine(med.id)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <MedicineModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSaveMedicine}
            initialData={editingMedicine}
          />
        </main>
      </div>
    </div>
  );
}
