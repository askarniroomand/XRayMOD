'use client';

import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Radar,
  LogOut,
  Zap,
  Menu,
  X,
  Wifi,
  Server,
  Layers,
  LifeBuoy,
} from 'lucide-react';
import { api } from '@/lib/api';
import { goPanel, getPanelPrefix } from '@/lib/paths';
import { PanelLink } from '@/components/panel-link';
import { LangToggle, useI18n, type DictKey } from '@/lib/i18n';

const NAV_ITEMS: { href: string; key: DictKey; icon: typeof LayoutDashboard }[] = [
  { href: '/panel', key: 'dashboard', icon: LayoutDashboard },
  { href: '/panel/users', key: 'users', icon: Users },
  { href: '/panel/nodes', key: 'nodes', icon: Server },
  { href: '/panel/config', key: 'config', icon: Shield },
  { href: '/panel/protocols', key: 'protocols', icon: Layers },
  { href: '/panel/cleanip', key: 'cleanip', icon: Radar },
  { href: '/panel/network', key: 'network', icon: Wifi },
  { href: '/panel/settings', key: 'settings', icon: Settings },
  { href: '/panel/support', key: 'support', icon: LifeBuoy },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const prefix = useMemo(() => getPanelPrefix(), [pathname]);
  const { t } = useI18n();

  /** Path without UUID prefix for active matching */
  const logicalPath = useMemo(() => {
    if (prefix && pathname.startsWith(prefix)) {
      return pathname.slice(prefix.length) || '/';
    }
    // Browser may still show /uuid/... while Next thinks otherwise
    const segs = pathname.split('/').filter(Boolean);
    if (segs.length >= 2 && segs[0].includes('-')) {
      return '/' + segs.slice(1).join('/');
    }
    return pathname;
  }, [pathname, prefix]);

  const handleLogout = async () => {
    try {
      await api.post('/api/logout');
    } catch { /* ignore */ }
    goPanel('/login');
  };

  const isActive = (href: string) =>
    logicalPath === href || (href !== '/panel' && logicalPath.startsWith(href));

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] border-r border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl p-5 space-y-6 sticky top-0 h-screen shrink-0">
        <PanelLink href="/panel" className="flex items-center gap-3 px-2 group">
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
            <Zap className="text-black w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase">
            Xray<span className="text-emerald-400">Mod</span>
          </span>
        </PanelLink>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <PanelLink
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-emerald-500/12 text-emerald-400 shadow-sm shadow-emerald-500/5'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                }`}
              >
                <item.icon size={18} className={active ? 'text-emerald-400' : 'opacity-80'} />
                {t(item.key)}
              </PanelLink>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-zinc-900/80 space-y-3">
          <div className="px-2">
            <LangToggle />
          </div>
          {prefix && (
            <p className="px-3 text-[10px] text-zinc-600 font-mono truncate" title={prefix}>
              {prefix.slice(0, 18)}…
            </p>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-rose-400 hover:bg-rose-400/5 transition-colors"
          >
            <LogOut size={18} />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="flex items-center justify-between px-4 py-3">
          <PanelLink href="/panel" className="flex items-center gap-2">
            <Zap className="text-emerald-500 w-5 h-5" />
            <span className="font-black tracking-tighter uppercase text-sm">
              Xray<span className="text-emerald-500">Mod</span>
            </span>
          </PanelLink>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-zinc-400 p-2 rounded-lg hover:bg-zinc-900"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="px-3 pb-4 space-y-0.5 max-h-[75vh] overflow-y-auto border-t border-zinc-900">
            {NAV_ITEMS.map((item) => (
              <PanelLink
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm ${
                  isActive(item.href)
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {t(item.key)}
              </PanelLink>
            ))}
            <div className="px-3 py-2">
              <LangToggle />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-zinc-500 hover:text-rose-400 w-full"
            >
              <LogOut size={18} />
              {t('logout')}
            </button>
          </nav>
        )}
      </div>

      <main className="flex-1 overflow-y-auto pt-14 md:pt-0 min-w-0">
        <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-6xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
