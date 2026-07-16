'use client';

import { useEffect, useState } from 'react';
import { Users, Globe, Activity, Wifi, ArrowRight, Shield, Radar, Copy } from 'lucide-react';
import { api, asList } from '@/lib/api';
import { StatCard, Card, CardHeader, ProgressBar, StatusBadge, Button } from '@/components';
import { PanelLink } from '@/components/panel-link';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';

interface SystemStatus {
  uptime: string;
  version: string;
  configured: boolean;
  kv: boolean;
  d1: boolean;
  traffic?: {
    today: { up: number; down: number; total: number };
    month: { up: number; down: number; total: number };
  };
}

export default function DashboardPage() {
  const { t } = useI18n();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [users, setUsers] = useState<{ total: number; active: number }>({ total: 0, active: 0 });
  const [subHint, setSubHint] = useState('');

  useEffect(() => {
    api.get('/api/health').then((d) => setStatus(d)).catch(() => {});
    api.get('/api/users').then((d) => {
      const list = asList<any>(d);
      setUsers({
        total: list.length,
        active: list.filter((x) => x.status === 'active' || x.enable !== false).length,
      });
      const admin = list.find((x) => x.role === 'admin') || list[0];
      if (admin?.uuid || admin?.sub_id) {
        setSubHint(`${window.location.origin}/sub/${admin.uuid || admin.sub_id}`);
      }
    }).catch(() => {});
  }, []);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const today = status?.traffic?.today;
  const month = status?.traffic?.month;

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">{t('dashboard')}</h1>
          <p className="text-zinc-500 mt-1">{t('overview')}</p>
          <p className="text-xs text-emerald-400/90 mt-2 font-medium">{t('recommended')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PanelLink href="/panel/users">
            <Button size="sm" variant="secondary">
              <Users size={14} /> {t('manageUsers')}
            </Button>
          </PanelLink>
          <PanelLink href="/panel/cleanip">
            <Button size="sm">
              <Radar size={14} /> {t('scanClean')}
            </Button>
          </PanelLink>
          <PanelLink href="/panel/stealth">
            <Button size="sm" variant="secondary">
              <Shield size={14} /> استیلث
            </Button>
          </PanelLink>
          <PanelLink href="/panel/support">
            <Button size="sm" variant="secondary">
              {t('support')}
            </Button>
          </PanelLink>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('users')} value={String(users.total)} subtitle={`${users.active} ${t('active')}`} icon={Users} color="emerald" />
        <StatCard title={t('status')} value={status?.configured ? t('active') : 'Setup'} subtitle={status?.version || 'XRayMOD'} icon={Wifi} color={status?.configured ? 'emerald' : 'amber'} />
        <StatCard title={t('todayTraffic')} value={formatBytes(today?.total || 0)} subtitle={`↑ ${formatBytes(today?.up || 0)} / ↓ ${formatBytes(today?.down || 0)}`} icon={Activity} color="blue" />
        <StatCard title={t('monthTraffic')} value={formatBytes(month?.total || 0)} subtitle={t('total')} icon={Globe} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title={t('systemInfo')} />
          <div className="space-y-3">
            {[
              [t('version'), status?.version || 'N/A'],
              [t('uptime'), status?.uptime || 'N/A'],
              [t('storage'), status?.d1 ? 'D1' : 'KV'],
              [t('configured'), status?.configured ? t('yes') : t('no')],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                <span className="text-sm text-zinc-400">{k}</span>
                <span className="text-sm font-mono">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title={t('traffic')} />
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-2">
                <span>Upload</span>
                <span className="font-mono">{formatBytes(month?.up || 0)}</span>
              </div>
              <ProgressBar value={month?.up || 0} max={Math.max(month?.total || 1, 1)} color="emerald" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-2">
                <span>Download</span>
                <span className="font-mono">{formatBytes(month?.down || 0)}</span>
              </div>
              <ProgressBar value={month?.down || 0} max={Math.max(month?.total || 1, 1)} color="blue" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PanelLink href="/panel/config" className="group block">
          <Card className="h-full hover:border-emerald-500/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400"><Shield size={18} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{t('config')}</p>
                <p className="text-xs text-zinc-500 mt-1">{t('recommended')}</p>
              </div>
              <ArrowRight size={16} className="text-zinc-600 group-hover:text-emerald-400" />
            </div>
          </Card>
        </PanelLink>
        <PanelLink href="/panel/network" className="group block">
          <Card className="h-full hover:border-blue-500/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400"><Wifi size={18} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{t('network')}</p>
                <p className="text-xs text-zinc-500 mt-1">DNS · WARP · IPv6</p>
              </div>
              <ArrowRight size={16} className="text-zinc-600 group-hover:text-blue-400" />
            </div>
          </Card>
        </PanelLink>
        <Card className="h-full">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400"><Globe size={18} /></div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{t('subLink')}</p>
              <p className="text-[11px] text-zinc-500 mt-1 font-mono truncate">{subHint || '—'}</p>
            </div>
            {subHint && (
              <button
                type="button"
                className="text-zinc-500 hover:text-emerald-400 p-1"
                onClick={() => {
                  navigator.clipboard.writeText(subHint);
                  toast.success(t('copied'));
                }}
              >
                <Copy size={16} />
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
