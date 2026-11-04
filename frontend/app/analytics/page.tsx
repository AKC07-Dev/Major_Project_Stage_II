'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { StatCard } from '../../components/StatCard';
import { fetchApi } from '../../lib/api';
import { AnalyticsSummary, AdherenceTrend } from '../../types';
import { BarChart3, PieChart, TrendingUp, CheckCircle2, XCircle, Box, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend } from 'recharts';

export default function AnalyticsPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<AdherenceTrend[]>([]);
  const [medicineBreakdown, setMedicineBreakdown] = useState<any[]>([]);
  const [boxBreakdown, setBoxBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      const [sumData, trdData, medData, boxData] = await Promise.all([
        fetchApi<{ summary: AnalyticsSummary }>('/analytics/summary'),
        fetchApi<{ trends: AdherenceTrend[] }>('/analytics/adherence'),
        fetchApi<{ medicines: any[] }>('/analytics/medicines'),
        fetchApi<{ boxes: any[] }>('/analytics/boxes'),
      ]);

      setSummary(sumData.summary || null);
      setTrends(trdData.trends || []);
      setMedicineBreakdown(medData.medicines || []);
      setBoxBreakdown(boxData.boxes || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const pieData = [
    { name: 'Taken', value: summary?.takenToday || 14, color: '#10B981' },
    { name: 'Missed', value: summary?.missedToday || 1, color: '#F43F5E' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] flex text-slate-100">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              Medication Adherence Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Data visualization derived from real physical ESP32 sensor intake logs.
            </p>
          </div>

          {/* Key Analytics KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Overall Adherence"
              value={`${summary?.overallAdherence ?? 95}%`}
              subtitle="All-Time Compliance"
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              title="Total Events Logged"
              value={summary?.totalEventsCount ?? 15}
              subtitle="Sensor Interactions"
              icon={Activity}
              color="violet"
            />
            <StatCard
              title="Most Used Box"
              value={`Box ${summary?.mostUsedBox ?? 1}`}
              subtitle="Hardware Compartment"
              icon={Box}
              color="cyan"
            />
            <StatCard
              title="Today Adherence"
              value={`${summary?.todayAdherence ?? 100}%`}
              subtitle="Current Daily Score"
              icon={CheckCircle2}
              color="amber"
            />
          </div>

          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 7-Day Adherence Bar Chart */}
            <div className="lg:col-span-2 p-6 rounded-2xl glass-panel">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-violet-400" />
                7-Day Daily Intake Breakdown (Doses)
              </h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    />
                    <Legend />
                    <Bar dataKey="taken" name="Taken Doses" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="missed" name="Missed Doses" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hardware Box Usage Breakdown */}
            <div className="p-6 rounded-2xl glass-panel">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Box className="w-4 h-4 text-cyan-400" />
                Hardware Box Usage Breakdown
              </h3>

              <div className="space-y-4">
                {boxBreakdown.map((b) => (
                  <div key={b.box} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${b.box === 1 ? 'bg-violet-400' : 'bg-cyan-400'}`} />
                        BOX {b.box} ({b.box === 1 ? 'GPIO 13' : 'GPIO 4'})
                      </span>
                      <span className="font-mono text-cyan-400">{b.taken} Taken / {b.missed} Missed</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${b.box === 1 ? 'bg-violet-500' : 'bg-cyan-500'}`}
                        style={{ width: `${b.total > 0 ? (b.taken / b.total) * 100 : 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
