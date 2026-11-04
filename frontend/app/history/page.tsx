'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { EventTable } from '../../components/EventTable';
import { fetchApi } from '../../lib/api';
import { MedicationEvent } from '../../types';
import { History, Filter, Calendar } from 'lucide-react';

export default function HistoryPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [events, setEvents] = useState<MedicationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterTime, setFilterTime] = useState<string>('7days');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterBox, setFilterBox] = useState<string>('');

  const loadHistory = async () => {
    setLoading(true);
    try {
      let query = `?filter=${filterTime}`;
      if (filterStatus) query += `&status=${filterStatus}`;
      if (filterBox) query += `&boxNumber=${filterBox}`;

      const data = await fetchApi<{ events: MedicationEvent[] }>(`/events${query}`);
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [filterTime, filterStatus, filterBox]);

  return (
    <div className="min-h-screen bg-[#0B0F17] flex text-slate-100">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-violet-400" />
              Medication History Log
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Audit log of all physical box opening events, intake confirmations, and missed dose windows.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>Filter Logs:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Range Filter */}
              <select
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-violet-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-violet-500"
              >
                <option value="">All Statuses</option>
                <option value="TAKEN">TAKEN</option>
                <option value="MISSED">MISSED</option>
              </select>

              {/* Box Filter */}
              <select
                value={filterBox}
                onChange={(e) => setFilterBox(e.target.value)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-violet-500"
              >
                <option value="">All Boxes</option>
                <option value="1">Box 1 (Lid Sensor)</option>
                <option value="2">Box 2 (Proximity Hand)</option>
              </select>
            </div>
          </div>

          {/* Event Log Table */}
          <EventTable events={events} isLoading={loading} />
        </main>
      </div>
    </div>
  );
}
