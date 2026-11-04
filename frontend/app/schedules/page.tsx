'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { ScheduleModal } from '../../components/ScheduleModal';
import { fetchApi } from '../../lib/api';
import { Schedule, Medicine } from '../../types';
import { Calendar, Plus, Clock, Box, Edit2, Trash2, Power, AlertCircle, CheckCircle } from 'lucide-react';

export default function SchedulesPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [schData, medData] = await Promise.all([
        fetchApi<{ schedules: Schedule[] }>('/schedules'),
        fetchApi<{ medicines: Medicine[] }>('/medicines'),
      ]);
      setSchedules(schData.schedules || []);
      setMedicines(medData.medicines || []);
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSchedule = async (formData: any) => {
    setWarningMessage(null);
    if (editingSchedule) {
      const res: any = await fetchApi(`/schedules/${editingSchedule.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      if (res.warning) setWarningMessage(res.warning);
    } else {
      const res: any = await fetchApi('/schedules', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (res.warning) setWarningMessage(res.warning);
    }
    loadData();
  };

  const handleToggleSchedule = async (sch: Schedule) => {
    await fetchApi(`/schedules/${sch.id}`, {
      method: 'PUT',
      body: JSON.stringify({ enabled: !sch.enabled }),
    });
    loadData();
  };

  const handleDeleteSchedule = async (id: string) => {
    if (confirm('Are you sure you want to delete this medication schedule?')) {
      await fetchApi(`/schedules/${id}`, { method: 'DELETE' });
      loadData();
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
                <Calendar className="w-6 h-6 text-violet-400" />
                Schedule Management
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Configure medication intake windows & hardware box bindings. ESP32 syncs automatically.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingSchedule(null);
                setModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 font-bold text-white text-xs hover:opacity-90 shadow-lg shadow-violet-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Schedule
            </button>
          </div>

          {warningMessage && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>{warningMessage}</span>
            </div>
          )}

          {/* Schedule List Cards */}
          {loading ? (
            <div className="p-12 text-center glass-panel">
              <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading schedules...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-2xl">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Medication Schedules Configured</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Create your first medication schedule to begin automatic ESP32 hardware synchronization.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schedules.map((sch) => (
                <div
                  key={sch.id}
                  className={`p-6 rounded-2xl glass-panel relative flex flex-col justify-between transition-all ${
                    sch.enabled ? 'border-slate-800/80 hover:border-violet-500/40' : 'opacity-60 border-slate-800/40 bg-slate-950/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-violet-950/60 text-violet-300 border border-violet-800/50">
                        <Box className="w-3.5 h-3.5 text-violet-400" />
                        BOX {sch.boxNumber}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sch.enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {sch.enabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{sch.medicine?.name || 'Medication'}</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono text-cyan-400">
                      <Clock className="w-3.5 h-3.5" />
                      {sch.startTime} &ndash; {sch.endTime}
                    </p>

                    {sch.medicine?.instructions && (
                      <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/60">
                        {sch.medicine.instructions}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleSchedule(sch)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                        sch.enabled
                          ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-amber-950/30'
                          : 'bg-emerald-950/40 border-emerald-800 text-emerald-400 hover:bg-emerald-900/40'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {sch.enabled ? 'Disable' : 'Enable'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingSchedule(sch);
                          setModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(sch.id)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Schedule Create/Edit Modal */}
          <ScheduleModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSaveSchedule}
            medicines={medicines}
            initialData={editingSchedule}
          />
        </main>
      </div>
    </div>
  );
}
