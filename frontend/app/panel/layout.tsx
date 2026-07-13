'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Server, Users, Shield, Settings, Radar,
  LogOut, Zap, Menu, X, Globe, Wifi
} from 'lucide-react';
import { api } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/panel', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/panel/config', label: 'Config', icon: Shield },
  { href: '/panel/users', label: 'Users', icon: Users },
  { href: '/panel/cleanip', label: 'Clean IP', icon: Radar },
  { href: '/panel/network', label: 'Network', icon: Wifi },
  { href: '/panel/settings', label: 'Settings', icon: Settings },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try { await api.post('/api/logout'); } catch {}
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-zinc-950 p-6 space-y-8 sticky top-0 h-screen">
        <Link href="/panel" className="flex items-center gap-3 px-2">
          <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
            <Zap className="text-black w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">
            Xray<span className="text-emerald-500">Mod</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/panel' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-zinc-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-rose-400 hover:bg-rose-400/5 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/panel" className="flex items-center gap-2">
            <Zap className="text-emerald-500 w-5 h-5" />
            <span className="font-black tracking-tighter uppercase text-sm">
              Xray<span className="text-emerald-500">Mod</span>
            </span>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-zinc-400">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="px-4 pb-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white"
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-rose-400">
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-8 pb-28 md:pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}
