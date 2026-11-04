'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Pill,
  History,
  BarChart3,
  Cpu,
  Bell,
  Settings,
  LogOut,
  ShieldAlert,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Schedules', href: '/schedules', icon: CalendarCheck },
    { label: 'Medicines', href: '/medicines', icon: Pill },
    { label: 'History Log', href: '/history', icon: History },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Device Monitor', href: '/device', icon: Cpu },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('smb_auth_token');
    localStorage.removeItem('smb_user');
    router.push('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0B0F17] border-r border-slate-800/80 w-64 p-4 text-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 py-4 mb-6 border-b border-slate-800/60">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide">SMART BOX</h1>
            <p className="text-[10px] text-cyan-400 font-medium tracking-wider uppercase">Caretaker Care</p>
          </div>
        </Link>
        {mobileOpen && (
          <button onClick={onCloseMobile} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/20 text-white border border-violet-500/40 shadow-sm shadow-violet-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400 glow-cyan' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Device Status Snippet */}
      <div className="pt-4 mt-4 border-t border-slate-800/60 space-y-3">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Hardware ID</span>
            <span className="font-mono text-cyan-400 font-semibold">SMB-ESP32</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ESP32 Synchronized
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/30 hover:border hover:border-rose-900/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 max-w-xs">{navContent}</div>
        </div>
      )}
    </>
  );
}
