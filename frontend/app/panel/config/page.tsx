'use client';

import { useEffect, useState } from 'react';
import { Save, RefreshCw, Copy, ExternalLink, Shield, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardHeader, Button, Input, Toggle } from '@/components';

interface Config {
  protocol: string;
  host: string[];
  path: string;
  uuid: string;
  network: string;
  security: string;
  fingerprint: string;
  flow: string;
  allowInsecure: boolean;
  // ECH
  enableECH: boolean;
  echSNI: string;
  // TLS Fragment
  enableFragment: boolean;
  fragmentLength: string;
  fragmentSleep: string;
  // Sub settings
  subName: string;
  subBanner: string;
  // Subscription formats
  subBase64: boolean;
  subClash: boolean;
  subSingbox: boolean;
  // Misc
  mixedProtocol: boolean;
  paused: boolean;
}

const defaultConfig: Config = {
  protocol: 'vless',
  host: [],
  path: '',
  uuid: '',
  network: 'ws',
  security: 'tls',
  fingerprint: 'chrome',
  flow: '',
  allowInsecure: false,
  enableECH: false,
  echSNI: '',
  enableFragment: false,
  fragmentLength: '100-200',
  fragmentSleep: '50-100',
  subName: 'XRayMOD',
  subBanner: '',
  subBase64: true,
  subClash: true,
  subSingbox: true,
  mixedProtocol: false,
  paused: false,
};

export default function ConfigPage() {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [hosts, setHosts] = useState<string[]>([]);
  const [newHost, setNewHost] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/config.json').then(d => {
      if (d) {
        setConfig({ ...defaultConfig, ...d });
        if (d.host) setHosts(Array.isArray(d.host) ? d.host : [d.host]);
      }
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/admin/config.json', { ...config, host: hosts });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {}
    setSaving(false);
  };

  const addHost = () => {
    if (newHost && !hosts.includes(newHost)) {
      setHosts([...hosts, newHost]);
      setNewHost('');
    }
  };

  const removeHost = (h: string) => {
    setHosts(hosts.filter(x => x !== h));
  };

  const copySubLink = () => {
    const host = hosts[0] || window.location.hostname;
    const path = config.path || '/';
    navigator.clipboard.writeText(`https://${host}${path}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Configuration</h1>
          <p className="text-zinc-500 text-sm mt-1">Protocol, hosts, transport and security settings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={copySubLink}>
            <Copy size={14} /> Copy Sub Link
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? 'Saved!' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Protocol & Transport */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Protocol" description="Select proxy protocol" />
          <div className="grid grid-cols-3 gap-2">
            {['vless', 'trojan', 'ss'].map(p => (
              <button
                key={p}
                onClick={() => setConfig({ ...config, protocol: p })}
                className={`py-3 rounded-xl text-sm font-bold uppercase transition-all ${
                  config.protocol === p
                    ? 'bg-emerald-600 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Transport</label>
              <div className="grid grid-cols-4 gap-2">
                {['ws', 'grpc', 'xhttp', 'tcp'].map(t => (
                  <button
                    key={t}
                    onClick={() => setConfig({ ...config, network: t })}
                    className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                      config.network === t
                        ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/50'
                        : 'bg-zinc-800/50 text-zinc-500 border border-transparent hover:border-zinc-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Path"
              value={config.path}
              onChange={e => setConfig({ ...config, path: e.target.value })}
              placeholder="/"
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Security" description="TLS and encryption settings" />
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Security</label>
              <div className="grid grid-cols-3 gap-2">
                {['tls', 'reality', 'none'].map(s => (
                  <button
                    key={s}
                    onClick={() => setConfig({ ...config, security: s })}
                    className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                      config.security === s
                        ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/50'
                        : 'bg-zinc-800/50 text-zinc-500 border border-transparent hover:border-zinc-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Fingerprint</label>
              <select
                value={config.fingerprint}
                onChange={e => setConfig({ ...config, fingerprint: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              >
                {['chrome', 'firefox', 'safari', 'edge', 'random', 'none'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <Toggle
              label="Allow Insecure"
              description="Skip TLS certificate verification"
              checked={config.allowInsecure}
              onChange={v => setConfig({ ...config, allowInsecure: v })}
            />
          </div>
        </Card>
      </div>

      {/* Host Management */}
      <Card>
        <CardHeader
          title="Hosts"
          description="Domain pool for subscription nodes"
          action={
            <div className="flex gap-2">
              <input
                value={newHost}
                onChange={e => setNewHost(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addHost()}
                placeholder="Add domain..."
                className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs focus:outline-none focus:border-emerald-500 w-48"
              />
              <Button size="sm" onClick={addHost}>Add</Button>
            </div>
          }
        />
        <div className="space-y-2">
          {hosts.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4 text-center">No hosts configured. Add a domain to get started.</p>
          ) : (
            hosts.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 bg-zinc-800/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-mono">{h}</span>
                </div>
                <button onClick={() => removeHost(h)} className="text-xs text-zinc-500 hover:text-rose-400">Remove</button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Advanced Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="ECH (Encrypted Client Hello)" />
          <div className="space-y-3">
            <Toggle
              label="Enable ECH"
              description="Encrypt TLS Client Hello for better anti-censorship"
              checked={config.enableECH}
              onChange={v => setConfig({ ...config, enableECH: v })}
            />
            {config.enableECH && (
              <Input
                label="ECH SNI"
                value={config.echSNI}
                onChange={e => setConfig({ ...config, echSNI: e.target.value })}
                placeholder="cloudflare-ech.com"
              />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="TLS Fragment" />
          <div className="space-y-3">
            <Toggle
              label="Enable Fragment"
              description="Split TLS handshake to bypass DPI"
              checked={config.enableFragment}
              onChange={v => setConfig({ ...config, enableFragment: v })}
            />
            {config.enableFragment && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Length Range"
                  value={config.fragmentLength}
                  onChange={e => setConfig({ ...config, fragmentLength: e.target.value })}
                  placeholder="100-200"
                />
                <Input
                  label="Sleep Range"
                  value={config.fragmentSleep}
                  onChange={e => setConfig({ ...config, fragmentSleep: e.target.value })}
                  placeholder="50-100"
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Subscription Settings */}
      <Card>
        <CardHeader title="Subscription" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Subscription Name"
            value={config.subName}
            onChange={e => setConfig({ ...config, subName: e.target.value })}
            placeholder="XRayMOD"
          />
          <Input
            label="Banner Text"
            value={config.subBanner}
            onChange={e => setConfig({ ...config, subBanner: e.target.value })}
            placeholder="Optional banner for subscription page"
          />
        </div>
        <div className="mt-4 space-y-2">
          <Toggle
            label="Base64 Format"
            checked={config.subBase64}
            onChange={v => setConfig({ ...config, subBase64: v })}
          />
          <Toggle
            label="Clash/Mihomo Format"
            checked={config.subClash}
            onChange={v => setConfig({ ...config, subClash: v })}
          />
          <Toggle
            label="sing-box Format"
            checked={config.subSingbox}
            onChange={v => setConfig({ ...config, subSingbox: v })}
          />
          <Toggle
            label="Mixed Protocol"
            description="Cycle between VLESS, Trojan, and SS"
            checked={config.mixedProtocol}
            onChange={v => setConfig({ ...config, mixedProtocol: v })}
          />
        </div>
      </Card>

      {/* Service Control */}
      <Card>
        <CardHeader title="Service Control" />
        <Toggle
          label="Pause Service"
          description="Block all proxy and subscription requests (503)"
          checked={config.paused}
          onChange={v => setConfig({ ...config, paused: v })}
        />
      </Card>
    </div>
  );
}
