'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { StatCard } from '../../components/StatCard';
import { MedicationCard } from '../../components/MedicationCard';
import { DeviceStatusCard } from '../../components/DeviceStatusCard';
import { EventTable } from '../../components/EventTable';
import { fetchApi } from '../../lib/api';
import { Schedule, MedicationEvent, DeviceStatus, AnalyticsSummary, AdherenceTrend } from '../../types';
import { Pill, CheckCircle2, XCircle, Clock, Activity, CalendarCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [events, setEvents] = useState<MedicationEvent[]>([]);
  const [device, setDevice] = useState<DeviceStatus | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<AdherenceTrend[]>([]);

  const loadData = async () => {
    try {
      const [schData, evtData, devData, sumData, trdData] = await Promise.all([
        fetchApi<{ schedules: Schedule[] }>('/schedules'),
        fetchApi<{ events: MedicationEvent[] }>('/events?limit=10'),
        fetchApi<{ device: DeviceStatus }>('/device/status'),
        fetchApi<{ summary: AnalyticsSummary }>('/analytics/summary'),
        fetchApi<{ trends: AdherenceTrend[] }>('/analytics/adherence'),
      ]);

      setSchedules(schData.schedules || []);
      setEvents(evtData.events || []);
      setDevice(devData.device || null);
      setSummary(sumData.summary || null);
      setTrends(trdData.trends || []);
    } catch (err) {
      console.error('[Dashboard Data Load Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s live poll
    return () => clearInterval(interval);
  }, []);

  // Determine next active/due schedule based on current IST time
  const getNextSchedule = () => {
    if (schedules.length === 0) return { schedule: null, isDueNow: false };
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    // Check if any schedule is active RIGHT NOW
    const active = schedules.find((s) => {
      const start = s.startHour * 60 + s.startMinute;
      const end = s.endHour * 60 + s.endMinute;
      return currentMins >= start && currentMins < end;
    });

    if (active) return { schedule: active, isDueNow: true };

    // Otherwise find next upcoming schedule today
    const upcoming = schedules.find((s) => {
      const start = s.startHour * 60 + s.startMinute;
      return start > currentMins;
    });

    return { schedule: upcoming || schedules[0], isDueNow: false };
  };

  const { schedule: nextSchedule, isDueNow } = getNextSchedule();

  return (
    <div className="min-h-screen bg-[#0B0F17] flex text-slate-100">
      {/* Responsive Sidebar */}
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      {/* Main Content View */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} deviceStatus={device || undefined} />

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Medication Dashboard</h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time patient adherence monitoring & smart box telemetry
              </p>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              title="Today Doses"
              value={summary?.todayDoses ?? 3}
              subtitle="Scheduled Today"
              icon={Pill}
              color="violet"
            />
            <StatCard
              title="Taken"
              value={summary?.takenToday ?? 2}
              subtitle="Successfully Detected"
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard
              title="Missed"
              value={summary?.missedToday ?? 0}
              subtitle="Expired Windows"
              icon={XCircle}
              color="rose"
            />
            <StatCard
              title="Pending"
              value={summary?.pendingToday ?? 1}
              subtitle="Awaiting Intake"
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Adherence"
              value={`${summary?.todayAdherence ?? 100}%`}
              subtitle="Compliance Rate"
              trend="+4% this week"
              icon={Activity}
              color="cyan"
            />
          </div>

          {/* Next Medicine & Device Telemetry Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MedicationCard schedule={nextSchedule} isDueNow={isDueNow} />
            </div>
            <div>
              <DeviceStatusCard device={device} />
            </div>
          </div>

          {/* Timeline & 7-Day Graph Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Medication Timeline */}
            <div className="p-6 rounded-2xl glass-panel flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <CalendarCheck className="w-4 h-4 text-cyan-400" />
                  Today's Intake Schedule
                </h3>

                <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                  {schedules.map((s) => {
                    const matchedEvent = events.find(
                      (e) => e.boxNumber === s.boxNumber && new Date(e.timestamp).toDateString() === new Date().toDateString()
                    );

                    const isTaken = matchedEvent?.status === 'TAKEN';
                    const isMissed = matchedEvent?.status === 'MISSED';

                    return (
                      <div key={s.id} className="relative pl-8 flex items-center justify-between text-xs">
                        <span
                          className={`absolute left-1.5 w-3 h-3 rounded-full border-2 bg-[#0B0F17] ${
                            isTaken
                              ? 'border-emerald-400 bg-emerald-500'
                              : isMissed
                              ? 'border-rose-400 bg-rose-500'
                              : 'border-amber-400 bg-amber-500 animate-pulse'
                          }`}
                        />
                        <div>
                          <p className="font-bold text-white">{s.medicine?.name || 'Medicine'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {s.startTime} &ndash; {s.endTime} &bull; Box {s.boxNumber}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isTaken
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : isMissed
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {isTaken ? 'TAKEN' : isMissed ? 'MISSED' : 'PENDING'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 7-Day Adherence Line Chart */}
            <div className="lg:col-span-2 p-6 rounded-2xl glass-panel">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-violet-400" />
                7-Day Adherence Trend (%)
              </h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="adherence"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#06B6D4' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Event Stream */}
          <div>
            <h3 className="text-base font-bold text-white mb-3">Live Sensor Events</h3>
            <EventTable events={events} isLoading={loading} />
          </div>
        </main>
      </div>
    </div>
  );
}
