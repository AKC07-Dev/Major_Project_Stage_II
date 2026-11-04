import React from 'react';
import { Cpu, Wifi, ShieldCheck, Clock, Radio, Activity } from 'lucide-react';
import { DeviceStatus } from '../types';

interface DeviceStatusCardProps {
  device?: DeviceStatus | null;
}

export function DeviceStatusCard({ device }: DeviceStatusCardProps) {
  const isOnline = device?.isOnline ?? true;
  const signal = device?.wifiSignal ?? -58;
  const firmware = device?.firmwareVersion ?? 'v1.2.0';

  return (
    <div className="p-6 rounded-2xl glass-panel relative overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">Smart Medicine Box</h4>
            <p className="text-xs text-slate-400 font-mono">ESP32 DevKit &bull; {device?.deviceId || 'SMB-ESP32-001'}</p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
          isOnline
            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
            : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
        }`}>
          <Activity className="w-3.5 h-3.5" />
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <p className="text-slate-400 flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            Wi-Fi Signal
          </p>
          <p className="text-sm font-bold text-white mt-1">{signal} dBm <span className="text-[10px] text-emerald-400 font-normal">(Excellent)</span></p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <p className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            Firmware
          </p>
          <p className="text-sm font-bold text-white mt-1">{firmware}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <p className="text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            Box 1 Sensor
          </p>
          <p className="text-sm font-bold text-slate-200 mt-1">Lid Closed (RAW 0)</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <p className="text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Box 2 Sensor
          </p>
          <p className="text-sm font-bold text-slate-200 mt-1">Normal (RAW 1)</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-500" />
          Last synced: {device?.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : 'Just now'}
        </span>
        <span className="text-cyan-400 font-medium">Auto Sync Active</span>
      </div>
    </div>
  );
}
