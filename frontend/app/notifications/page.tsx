'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { fetchApi } from '../../lib/api';
import { NotificationItem } from '../../types';
import { Bell, CheckCircle2, XCircle, Clock, Info, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await fetchApi<{ notifications: NotificationItem[] }>('/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await fetchApi('/notifications/all/read', { method: 'PATCH' });
    loadNotifications();
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex text-slate-100">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Bell className="w-6 h-6 text-violet-400" />
                Caretaker Notifications
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time alerts for dose intake events, missed windows, and device connectivity.
              </p>
            </div>

            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-400 hover:bg-slate-800 flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center glass-panel">
              <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading alerts...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-2xl">
              <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Notifications</h3>
              <p className="text-xs text-slate-400 mt-1">Alerts will appear here when medication events or device heartbeats are recorded.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl glass-panel flex items-start gap-4 transition-all ${
                    !n.read ? 'border-violet-500/40 bg-violet-950/20' : 'opacity-80'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 flex-shrink-0">
                    {n.type === 'TAKEN' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {n.type === 'MISSED' && <XCircle className="w-5 h-5 text-rose-400" />}
                    {n.type === 'REMINDER' && <Clock className="w-5 h-5 text-amber-400" />}
                    {n.type === 'SYSTEM' && <Info className="w-5 h-5 text-cyan-400" />}
                  </div>

                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{n.title}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
