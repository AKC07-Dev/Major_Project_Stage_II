'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { DeviceStatusCard } from '../../components/DeviceStatusCard';
import { fetchApi } from '../../lib/api';
import { DeviceStatus } from '../../types';
import { Cpu, Wifi, ShieldCheck, Activity, RefreshCw, Radio, CheckCircle } from 'lucide-react';

export default function DevicePage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [device, setDevice] = useState<DeviceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDeviceStatus = async () => {
    try {
      const data = await fetchApi<{ device: DeviceStatus }>('/device/status');
      setDevice(data.device || null);
    } catch (err) {
      console.error('Failed to fetch device status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeviceStatus();
    const interval = setInterval(loadDeviceStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] flex text-slate-100">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} deviceStatus={device || undefined} />

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Cpu className="w-6 h-6 text-cyan-400" />
                Physical Hardware Telemetry
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time connection monitoring, RSSI signal strength, and pin sensor state stream.
              </p>
            </div>

            <button
              onClick={loadDeviceStatus}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <DeviceStatusCard device={device} />

              {/* Hardware Wiring & GPIO Mapping */}
              <div className="p-6 rounded-2xl glass-panel">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <Radio className="w-4 h-4 text-violet-400" />
                  ESP32 GPIO Pin Assignment & Logic
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center justify-between font-bold text-white mb-2">
                      <span className="text-violet-400">BOX 1 SENSOR</span>
                      <span className="font-mono text-cyan-400">GPIO 13</span>
                    </div>
                    <p className="text-slate-400">Sensor Type: Lid / Light Digital IR</p>
                    <p className="text-slate-400 mt-1">CLOSED = RAW 0 &bull; OPEN = RAW 1</p>
                    <div className="mt-3 p-2 rounded bg-violet-950/40 border border-violet-800/40 text-[11px] text-violet-300 font-mono">
                      Event trigger: 0 &rarr; 1 (Lid Opened)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center justify-between font-bold text-white mb-2">
                      <span className="text-cyan-400">BOX 2 SENSOR</span>
                      <span className="font-mono text-cyan-400">GPIO 4</span>
                    </div>
                    <p className="text-slate-400">Sensor Type: Proximity Hand Sensor</p>
                    <p className="text-slate-400 mt-1">NORMAL = RAW 1 &bull; HAND = RAW 0</p>
                    <div className="mt-3 p-2 rounded bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300 font-mono">
                      Event trigger: 1 &rarr; 0 &rarr; 1 (Full Hand Event)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Physical OLED Screen State */}
            <div className="p-6 rounded-2xl glass-panel flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Physical OLED Display State
                </h3>

                <div className="p-4 rounded-xl bg-black border-2 border-slate-800 font-mono text-cyan-400 text-xs shadow-inner min-h-[160px] flex flex-col justify-center text-center space-y-2">
                  <p className="text-white font-bold text-sm tracking-widest uppercase">MEDICINE DUE</p>
                  <p className="text-amber-400">Morning Medicine</p>
                  <p className="text-lg font-extrabold text-cyan-300">BOX 1</p>
                  <p className="text-[10px] text-slate-400">Please take medicine</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
                <span>OLED Specs: 0.96" SSD1306 128x64</span>
                <span className="text-emerald-400 font-mono">SDA: 21 | SCL: 22</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
