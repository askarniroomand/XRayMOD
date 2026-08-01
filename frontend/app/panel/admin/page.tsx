'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  RefreshCw,
  Globe,
  Mail,
  Key,
  Pause,
  Play,
  Download,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardHeader, Button, Input } from '@/components';
import { toast } from 'sonner';

type Dash = {
  version: string;
  paused: boolean;
  users: number;
  traffic_used: number;
  monthly_cap_gb: number;
  usage_percent: number;
  warn_80: boolean;
  custom_domains: string[];
  cf_email: string;
  secure_path: string;
  panel_entry: string;
};

export default function AdminPage() {
  const [dash, setDash] = useState<Dash | null>(null);
  const [update, setUpdate] = useState<any>(null);
  const [domains, setDomains] = useState('');
  const [cfEmail, setCfEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [remoteCookie, setRemoteCookie] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/dashboard');
      if (res?.data) {
        setDash(res.data);
        setDomains((res.data.custom_domains || []).join(', '));
        setCfEmail(res.data.cf_email || '');
      }
      const u = await api.get('/api/admin/update-check');
      setUpdate(u);
    } catch {
      toast.error('Failed to load admin dashboard');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveDomains = async () => {
    const res = await api.put('/api/admin/domains', { domains });
    if (res.success === false) {
      toast.error(res.message || 'Failed');
      return;
    }
    toast.success('Custom domains saved — D-tagged configs in subs');
    load();
  };

  const saveEmail = async () => {
    const res = await api.put('/api/admin/cf-email', { email: cfEmail, enforce: true });
    if (res.success === false) {
      toast.error(res.message || 'Failed');
      return;
    }
    toast.success('Cloudflare email bound as login username');
    load();
  };

  const resetPass = async () => {
    if (newPass.length < 8) {
      toast.error('Min 8 characters');
      return;
    }
    const res = await api.post('/api/admin/reset-password', { password: newPass });
    if (res.success === false) {
      toast.error(res.message || 'Failed');
      return;
    }
    setNewPass('');
    toast.success('Password reset');
  };

  const togglePause = async () => {
    const res = await api.post('/api/admin/pause', { paused: !dash?.paused });
    if (res.success === false) {
      toast.error(res.message || 'Failed');
      return;
    }
    toast.success(res.paused ? 'Proxy paused (kill switch)' : 'Proxy resumed');
    load();
  };

  const remoteSync = async () => {
    const res = await api.post('/api/admin/remote-sync', {
      url: remoteUrl,
      cookie: remoteCookie || undefined,
    });
    if (res.success === false) {
      toast.error(res.message || 'Sync failed');
      return;
    }
    toast.success(res.message || `Imported ${res.imported} keys`);
  };

  const fmtBytes = (n: number) => {
    if (!n) return '0 B';
    const u = ['B', 'KB', 'MB', 'GB', 'TB'];
    let v = n;
    let i = 0;
    while (v >= 1024 && i < u.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(i > 1 ? 2 : 0)} ${u[i]}`;
  };

  if (loading && !dash) {
    return <div className="p-8 text-zinc-500">Loading admin…</div>;
  }

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Gen 5.1.1 · SECURE PATH · update · domains · CF email · kill switch
          </p>
        </div>
        <Button variant="secondary" onClick={load}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {dash?.warn_80 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          Usage over 80% of monthly cap ({dash.usage_percent}%). Consider raising the cap or pausing proxy.
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader title="Version" />
          <p className="text-2xl font-bold text-emerald-400">{dash?.version || '—'}</p>
        </Card>
        <Card>
          <CardHeader title="Users" />
          <p className="text-2xl font-bold">{dash?.users ?? '—'}</p>
        </Card>
        <Card>
          <CardHeader title="Traffic" />
          <p className="text-2xl font-bold">{fmtBytes(dash?.traffic_used || 0)}</p>
        </Card>
        <Card>
          <CardHeader title="Proxy" />
          <p className="text-2xl font-bold">{dash?.paused ? 'PAUSED' : 'ON'}</p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Update panel" />
        <p className="text-sm text-zinc-400 mb-3">
          Current <code className="text-emerald-400">{update?.current}</code>
          {update?.latest ? (
            <>
              {' '}
              · Latest <code className="text-emerald-400">{update.latest}</code>
            </>
          ) : null}
        </p>
        {update?.update_available ? (
          <div className="space-y-3">
            <p className="text-amber-300 text-sm">New release available.</p>
            <p className="text-xs text-zinc-500">{update.how}</p>
            {update.release_url && (
              <a
                href={update.release_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:underline"
              >
                <ExternalLink className="w-4 h-4" /> Open release
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">You are on the latest tracked release (or GitHub unreachable).</p>
        )}
        <div className="mt-4">
          <Button variant="secondary" onClick={() => api.get('/api/admin/update-check').then(setUpdate)}>
            <Download className="w-4 h-4 mr-2" />
            Check again
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="SECURE PATH entry" />
        <p className="text-xs text-zinc-500 mb-2">Never share this. Root URLs return 404.</p>
        <code className="block text-sm break-all bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-emerald-300">
          {dash?.panel_entry || '—'}
        </code>
      </Card>

      <Card>
        <CardHeader title="Custom domains (D tag)" />
        <p className="text-xs text-zinc-500 mb-3">
          Domains you already pointed to this Worker. Merged into subscriptions with · D · tag.
        </p>
        <Input
          value={domains}
          onChange={(e: any) => setDomains(e.target.value)}
          placeholder="cdn.example.com, panel.example.com"
        />
        <div className="mt-3 flex gap-2">
          <Button onClick={saveDomains}>
            <Globe className="w-4 h-4 mr-2" />
            Save domains
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Cloudflare email login" />
        <p className="text-xs text-zinc-500 mb-3">
          Login username must match this email (BPB-style hardening).
        </p>
        <Input
          value={cfEmail}
          onChange={(e: any) => setCfEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <div className="mt-3">
          <Button onClick={saveEmail}>
            <Mail className="w-4 h-4 mr-2" />
            Bind email
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Reset password" />
        <Input
          type="password"
          value={newPass}
          onChange={(e: any) => setNewPass(e.target.value)}
          placeholder="New password (min 8)"
        />
        <div className="mt-3">
          <Button onClick={resetPass}>
            <Key className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Kill switch" />
        <p className="text-xs text-zinc-500 mb-3">
          Pause all proxy traffic to reduce Cloudflare ToS/abuse risk while keeping the panel up.
        </p>
        <Button variant={dash?.paused ? 'primary' : 'secondary'} onClick={togglePause}>
          {dash?.paused ? (
            <>
              <Play className="w-4 h-4 mr-2" /> Resume proxy
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 mr-2" /> Pause proxy
            </>
          )}
        </Button>
      </Card>

      <Card>
        <CardHeader title="Remote settings sync" />
        <p className="text-xs text-zinc-500 mb-3">
          Pull settings from another XRayMOD panel. SECURE PATH, UUID, domains and secrets are excluded.
        </p>
        <div className="space-y-2">
          <Input
            value={remoteUrl}
            onChange={(e: any) => setRemoteUrl(e.target.value)}
            placeholder="https://xxx.workers.dev/SECURE_PATH"
          />
          <Input
            value={remoteCookie}
            onChange={(e: any) => setRemoteCookie(e.target.value)}
            placeholder="session=… (optional Cookie header)"
          />
        </div>
        <div className="mt-3">
          <Button variant="secondary" onClick={remoteSync}>
            Sync now
          </Button>
        </div>
      </Card>
    </div>
  );
}
