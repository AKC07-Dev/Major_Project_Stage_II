'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Bell, Wifi, WifiOff, RefreshCw, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface TopbarProps {
  onOpenMobileNav: () => void;
  deviceStatus?: {
    isOnline: boolean;
    lastSeen?: string | null;
    wifiSignal?: number;
  };
}

export function Topbar({ onOpenMobileNav, deviceStatus }: TopbarProps) {
  const [timeStr, setTimeStr] = useState<string>('');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Read stored user profile
    const storedUser = localStorage.getItem('smb_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    return () => clearInterval(interval);
  }, []);

  const isOnline = deviceStatus?.isOnline ?? true;

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#0B0F17]/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            Caretaker Control Panel
          </h2>
          <p className="text-xs text-slate-400 font-mono hidden sm:block">
            Asia/Kolkata (IST) &bull; <span className="text-slate-200 font-medium">{timeStr || '08:00 AM'}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Device Status Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            isOnline
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
              : 'bg-rose-950/40 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-500/10'
          }`}
        >
          {isOnline ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Wifi className="w-3.5 h-3.5" />
              <span>ONLINE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <WifiOff className="w-3.5 h-3.5" />
              <span>DEVICE OFFLINE</span>
            </>
          )}
        </div>

        {/* Notifications Icon Button */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500"></span>
        </Link>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
            {user?.name ? user.name.charAt(0) : 'C'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">{user?.name || 'Dr. Sarah Jenkins'}</p>
            <p className="text-[10px] text-slate-400">Primary Caretaker</p>
          </div>
        </div>
      </div>
    </header>
  );
}
