'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { Settings, User, Cpu, Send, ShieldCheck, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [name, setName] = useState('Dr. Sarah Jenkins');
  const [email, setEmail] = useState('caretaker@smartbox.com');
  const [telegramChatId, setTelegramChatId] = useState('6444710224');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('smb_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name) setName(u.name);
        if (u.email) setEmail(u.email);
      } catch (e) {}
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('smb_user', JSON.stringify({ name, email, role: 'CARETAKER' }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex text-slate-100">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-4xl">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-violet-400" />
              Caretaker & System Settings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure profile information, hardware security keys, and Telegram alert dispatch parameters.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Settings updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6 text-xs">
            {/* Caretaker Profile */}
            <div className="p-6 rounded-2xl glass-panel space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <User className="w-4 h-4 text-cyan-400" />
                Caretaker Profile Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Hardware Credentials */}
            <div className="p-6 rounded-2xl glass-panel space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Cpu className="w-4 h-4 text-violet-400" />
                Hardware Device Authorization
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">ESP32 Device Secret API Key</label>
                  <input
                    type="password"
                    value="SMB-ESP32-SECRET-API-KEY-2026"
                    readOnly
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Must match <code className="text-cyan-400">DEVICE_API_KEY</code> header sent by ESP32 HTTP client.</p>
                </div>
              </div>
            </div>

            {/* Telegram Notification Dispatch */}
            <div className="p-6 rounded-2xl glass-panel space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Send className="w-4 h-4 text-emerald-400" />
                Telegram Instant Alert Channel
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Caretaker Telegram Chat ID</label>
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">System Timezone</label>
                  <input
                    type="text"
                    value={timezone}
                    readOnly
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 font-bold text-white text-sm hover:opacity-90 transition-opacity shadow-lg shadow-violet-600/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
