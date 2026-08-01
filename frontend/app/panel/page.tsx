'use client';

import { useEffect, useState } from 'react';
import { Users, Globe, Activity, Wifi, ArrowUpRight, Shield, Radar, Copy, Crosshair } from 'lucide-react';
import { api, asList } from '@/lib/api';
import { StatCard, Card, CardHeader, ProgressBar, Button, PageHeader } from '@/components';
import { PanelLink } from '@/components/panel-link';
import { useI18n } from '@/lib/i18n';
import { getPanelPrefix, secureSubUrl } from '@/lib/paths';
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
    api
      .get('/api/users')
      .then((d) => {
        const list = asList<any>(d);
        setUsers({
          total: list.length,
          active: list.filter((x) => x.status === 'active' || x.enable !== false).length,
        });
        const admin = list.find((x) => x.role === 'admin') || list[0];
        const id = admin?.uuid || admin?.sub_id;
        if (id) {
          const url = secureSubUrl(id) || `${window.location.origin}${getPanelPrefix()}/sub/${id}`;
          setSubHint(url);
        }
      })
      .catch(() => {});
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
    <div className="page-shell space-y-7">
      <PageHeader
        eyebrow="Aperture"
        title={t('dashboard')}
        description={t('overview')}
        actions={
          <>
            <PanelLink href="/panel/users">
              <Button size="sm" variant="secondary">
                <Users size={14} /> {t('manageUsers')}
              </Button>
            </PanelLink>
            <PanelLink href="/panel/admin">
              <Button size="sm" variant="secondary">
                <Crosshair size={14} /> Admin
              </Button>
            </PanelLink>
            <PanelLink href="/panel/cleanip">
              <Button size="sm">
                <Radar size={14} /> {t('scanClean')}
              </Button>
            </PanelLink>
          </>
        }
      />

      <section className="hero-band">
        <div className="relative z-[1] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip chip-live">v{status?.version || '5.1.1'}</span>
              <span className={status?.configured ? 'chip chip-live' : 'chip chip-warn'}>
                {status?.configured ? t('active') : 'Setup pending'}
              </span>
            </div>
            <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight max-w-lg">
              XrayMOD control plane
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-md leading-relaxed">
              SECURE PATH · silent 404 · Admin Dashboard · D-tagged domains
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PanelLink href="/panel/stealth">
              <Button size="sm" variant="secondary">
                <Shield size={14} /> {t('stealth')}
              </Button>
            </PanelLink>
            <PanelLink href="/panel/config">
              <Button size="sm" variant="secondary">
                {t('config')} <ArrowUpRight size={14} />
              </Button>
            </PanelLink>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title={t('users')}
          value={String(users.total)}
          subtitle={`${users.active} ${t('active')}`}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title={t('status')}
          value={status?.configured ? t('active') : 'Setup'}
          subtitle={status?.version || '5.1.1'}
          icon={Wifi}
          color={status?.configured ? 'emerald' : 'amber'}
        />
        <StatCard
          title={t('todayTraffic')}
          value={formatBytes(today?.total || 0)}
          subtitle={`↑ ${formatBytes(today?.up || 0)} / ↓ ${formatBytes(today?.down || 0)}`}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title={t('monthTraffic')}
          value={formatBytes(month?.total || 0)}
          subtitle={t('total')}
          icon={Globe}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader title={t('systemInfo')} description="Runtime health snapshot" />
          <div className="space-y-0.5">
            {[
              [t('version'), status?.version || 'N/A'],
              [t('uptime'), status?.uptime || 'N/A'],
              [t('storage'), status?.d1 ? 'D1' : 'KV'],
              [t('configured'), status?.configured ? t('yes') : t('no')],
            ].map(([k, v]) => (
              <div
                key={String(k)}
                className="flex items-center justify-between py-2.5 border-b border-[var(--stroke)] last:border-0"
              >
                <span className="text-sm text-[var(--text-muted)]">{k}</span>
                <span className="text-sm font-mono tabular text-[var(--text)]">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title={t('traffic')} description="Upload / download this month" />
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-[11px] text-[var(--text-faint)] mb-2">
                <span>Upload</span>
                <span className="font-mono tabular">{formatBytes(month?.up || 0)}</span>
              </div>
              <ProgressBar value={month?.up || 0} max={Math.max(month?.total || 1, 1)} color="emerald" />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-[var(--text-faint)] mb-2">
                <span>Download</span>
                <span className="font-mono tabular">{formatBytes(month?.down || 0)}</span>
              </div>
              <ProgressBar value={month?.down || 0} max={Math.max(month?.total || 1, 1)} color="blue" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <PanelLink href="/panel/config" className="group block">
          <Card className="h-full transition-colors hover:border-[var(--accent)]/35">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">
                <Shield size={16} strokeWidth={1.9} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm">{t('config')}</p>
                <p className="text-[11px] text-[var(--text-faint)] mt-1">{t('recommended')}</p>
              </div>
              <ArrowUpRight
                size={15}
                className="text-[var(--text-faint)] group-hover:text-[var(--accent)] transition-colors"
              />
            </div>
          </Card>
        </PanelLink>
        <PanelLink href="/panel/network" className="group block">
          <Card className="h-full transition-colors hover:border-[var(--info)]/35">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-[rgba(94,176,255,0.12)] text-[var(--info)]">
                <Wifi size={16} strokeWidth={1.9} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm">{t('network')}</p>
                <p className="text-[11px] text-[var(--text-faint)] mt-1">DNS · WARP · IPv6</p>
              </div>
              <ArrowUpRight
                size={15}
                className="text-[var(--text-faint)] group-hover:text-[var(--info)] transition-colors"
              />
            </div>
          </Card>
        </PanelLink>
        <Card className="h-full">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-[var(--coral-soft)] text-[var(--coral)]">
              <Globe size={16} strokeWidth={1.9} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm">{t('subLink')}</p>
              <p className="text-[11px] text-[var(--text-faint)] mt-1 font-mono truncate">
                {subHint || '—'}
              </p>
            </div>
            {subHint && (
              <button
                type="button"
                className="text-[var(--text-faint)] hover:text-[var(--accent)] p-1 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(subHint);
                  toast.success(t('copied'));
                }}
              >
                <Copy size={15} />
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
