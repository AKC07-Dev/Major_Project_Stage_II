import React from 'react';
import Link from 'next/link';
import { Pill, ShieldCheck, Cpu, ArrowRight, Activity, BellRing, Database, LineChart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-white relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-violet-600/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header Navigation */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">SMART MEDICINE BOX</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-semibold text-slate-200 hover:text-white hover:border-slate-700 transition-colors"
          >
            Caretaker Login
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-violet-600/25 flex items-center gap-2"
          >
            Launch Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-950/60 border border-violet-800/60 text-xs font-semibold text-violet-300 mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Commercial IoT Healthcare Adherence Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
          Smarter Medication. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400">
            Safer Caretaker Monitoring.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal">
          An integrated IoT hardware & software solution connecting ESP32 physical medicine box sensors with real-time caretaker schedule management and adherence analytics.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 font-bold text-white hover:opacity-95 transition-all shadow-xl shadow-violet-600/20 flex items-center justify-center gap-2"
          >
            Open Caretaker Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            Sign In as Caretaker
          </Link>
        </div>

        {/* Live System Preview Badge */}
        <div className="mt-12 p-6 rounded-3xl glass-panel max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div>
            <p className="text-xs text-slate-400">Hardware Pin</p>
            <p className="text-sm font-mono font-bold text-cyan-400 mt-0.5">GPIO 13 / GPIO 4</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">OLED Screen</p>
            <p className="text-sm font-mono font-bold text-violet-400 mt-0.5">SSD1306 128x64</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Time Server</p>
            <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">NTP IST (+5:30)</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Telegram Bot</p>
            <p className="text-sm font-mono font-bold text-amber-400 mt-0.5">Active Alert API</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 border-t border-slate-800/60">
        <h2 className="text-2xl font-bold text-center text-white mb-12">How The System Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Schedule', desc: 'Caretaker configures time windows & box numbers on the web app.' },
            { step: '02', title: 'Remind', desc: 'ESP32 syncs schedule, shows OLED alerts & triggers Telegram.' },
            { step: '03', title: 'Detect', desc: 'IR & proximity sensors verify if Box 1 (0→1) or Box 2 (1→0→1) is opened.' },
            { step: '04', title: 'Record', desc: 'Dose intake or missed window event is pushed to database.' },
            { step: '05', title: 'Analyze', desc: 'Dashboard calculates 7-day adherence %, trends & reports.' },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl glass-panel relative">
              <span className="text-2xl font-black text-violet-500/40 font-mono">{item.step}</span>
              <h3 className="text-base font-bold text-white mt-2">{item.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Tech Stack */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 border-t border-slate-800/60 text-center">
        <h2 className="text-2xl font-bold text-white">Production Technical Architecture</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
          Built with an enterprise IoT stack ensuring low latency, offline resiliency, and strict hardware sensor state machine isolation.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl glass-panel">
            <Cpu className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-base font-bold text-white">ESP32 Firmware</h3>
            <p className="text-xs text-slate-400 mt-1">
              C++ Arduino framework with non-blocking HTTP REST schedule sync, debounced sensor logic, SSD1306 OLED, and Telegram HTTPS notifications.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel">
            <Database className="w-8 h-8 text-violet-400 mb-3" />
            <h3 className="text-base font-bold text-white">Node.js API & Prisma</h3>
            <p className="text-xs text-slate-400 mt-1">
              Express TypeScript backend, Prisma ORM schema, JWT caretaker authentication, and event deduplication engine.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel">
            <LineChart className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="text-base font-bold text-white">Next.js Web Dashboard</h3>
            <p className="text-xs text-slate-400 mt-1">
              App Router, Tailwind CSS dark glassmorphism, Recharts visualization, mobile responsive navigation, and real-time status polling.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>Smart Medicine Box &copy; 2026. IoT Medication Adherence & Caretaker Monitoring Platform.</p>
      </footer>
    </div>
  );
}
