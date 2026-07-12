'use client';

import { useEffect, useState } from 'react';
import { Shield, Zap, Globe } from 'lucide-react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/settings').then(d => { if (d.data) setSettings(d.data); }).catch(() => {});
  }, []);

  const update = (key: string, val: string) => setSettings(s => ({ ...s, [key]: val }));

  const save = async () => {
    setSaving(true);
    await api.put('/api/settings', settings);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black">Settings</h2>

      {/* Disguise */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2"><Shield size={18} className="text-rose-500" /> Disguise / Anti-Detection</h3>
        <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
          <div>
            <p className="font-bold">Enable Disguise</p>
            <p className="text-xs text-zinc-500">Show fake error page to unauthorized visitors</p>
          </div>
          <button
            onClick={() => update('disguise.enabled', settings['disguise.enabled'] === 'true' ? 'false' : 'true')}
            className={`w-12 h-6 rounded-full transition-colors ${settings['disguise.enabled'] === 'true' ? 'bg-emerald-500' : 'bg-zinc-700'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings['disguise.enabled'] === 'true' ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {settings['disguise.enabled'] === 'true' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Admin Path</label>
              <input value={settings['disguise.admin_path'] || ''} onChange={e => update('disguise.admin_path', e.target.value)} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" placeholder="/secret-admin" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Login Path</label>
              <input value={settings['disguise.login_path'] || ''} onChange={e => update('disguise.login_path', e.target.value)} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" placeholder="/secret-login" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Sub Path</label>
              <input value={settings['disguise.sub_path'] || ''} onChange={e => update('disguise.sub_path', e.target.value)} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" placeholder="/secret-sub" />
            </div>
          </div>
        )}
      </div>

      {/* Network */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2"><Zap size={18} className="text-amber-500" /> Network</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">ECH SNI</label>
            <input value={settings['ech.sni'] || ''} onChange={e => update('ech.sni', e.target.value)} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">ECH DNS</label>
            <input value={settings['ech.dns'] || ''} onChange={e => update('ech.dns', e.target.value)} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
      </div>

      {/* Telegram */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2"><Globe size={18} className="text-blue-500" /> Telegram Bot</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Bot Token</label>
            <input value={settings['tg.bot_token'] || ''} onChange={e => update('tg.bot_token', e.target.value)} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" placeholder="123456:ABC-DEF..." />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Chat ID</label>
            <input value={settings['tg.chat_id'] || ''} onChange={e => update('tg.chat_id', e.target.value)} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black font-bold rounded-xl text-sm">
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
