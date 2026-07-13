'use client';

import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Download, Upload, Trash2, Info, Shield, Key, Copy, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardHeader, Button, Input, Toggle, StatusBadge } from '@/components';

interface SystemInfo {
  version: string;
  uptime: string;
  configured: boolean;
  kv: boolean;
  d1: boolean;
  store: string;
}

interface SecuritySettings {
  password: string;
  passwordSource: string;
  twoFA: boolean;
}

export default function SettingsPage() {
  const [system, setSystem] = useState<SystemInfo | null>(null);
  const [security, setSecurity] = useState<SecuritySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Password change
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFACode, setTwoFACode] = useState('');

  useEffect(() => {
    api.get('/install/status').then(d => setSystem(d)).catch(() => {});
    api.get('/admin/security/status').then(d => {
      setSecurity(d);
      setTwoFAEnabled(d?.twoFA || false);
    }).catch(() => {});
  }, []);

  const changePassword = async () => {
    setPassError('');
    setPassSuccess('');
    if (newPass !== confirmPass) {
      setPassError('Passwords do not match');
      return;
    }
    if (newPass.length < 6) {
      setPassError('Password must be at least 6 characters');
      return;
    }
    try {
      const res = await api.post('/admin/security/change-password', { current: currentPass, new: newPass });
      if (res.success) {
        setPassSuccess('Password changed successfully');
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setPassError(res.error || 'Failed to change password');
      }
    } catch (e) {
      setPassError('Network error');
    }
  };

  const setup2FA = async () => {
    try {
      const res = await api.post('/admin/security/2fa-setup', {});
      if (res.secret) {
        setTwoFASecret(res.secret);
      }
    } catch {}
  };

  const enable2FA = async () => {
    try {
      const res = await api.post('/admin/security/2fa-enable', { code: twoFACode, secret: twoFASecret });
      if (res.success) {
        setTwoFAEnabled(true);
        setTwoFASecret('');
        setTwoFACode('');
      }
    } catch {}
  };

  const disable2FA = async () => {
    try {
      await api.post('/admin/security/2fa-disable', {});
      setTwoFAEnabled(false);
    } catch {}
  };

  const selfUpdate = async () => {
    if (!confirm('Update the worker to the latest version? This will restart the service.')) return;
    try {
      await api.post('/admin/self-update.json', {});
      alert('Update initiated. The worker will restart shortly.');
    } catch (e) {
      alert('Update failed');
    }
  };

  const exportConfig = async () => {
    try {
      const config = await api.get('/admin/config.json');
      const network = await api.get('/admin/network-settings.json');
      const blob = new Blob([JSON.stringify({ config, network }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xraymod-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const importConfig = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.config) await api.post('/admin/config.json', data.config);
        if (data.network) await api.post('/admin/network-settings.json', data.network);
        alert('Config imported successfully');
        window.location.reload();
      } catch {
        alert('Invalid config file');
      }
    };
    input.click();
  };

  const resetConfig = async () => {
    if (!confirm('Reset all settings to defaults? This cannot be undone.')) return;
    if (!confirm('Are you really sure? All your configuration will be lost.')) return;
    try {
      await api.post('/admin/init', {});
      alert('Config reset. Reloading...');
      window.location.reload();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">System info, security, and maintenance.</p>
      </div>

      {/* System Info */}
      <Card>
        <CardHeader title="System Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
              <span className="text-sm text-zinc-400">Version</span>
              <span className="text-sm font-mono font-bold">{system?.version || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
              <span className="text-sm text-zinc-400">Uptime</span>
              <span className="text-sm font-mono">{system?.uptime || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
              <span className="text-sm text-zinc-400">Storage</span>
              <StatusBadge status={system?.store?.toUpperCase() || 'N/A'} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-zinc-400">Configured</span>
              <StatusBadge status={system?.configured ? 'Yes' : 'No'} variant={system?.configured ? 'success' : 'warning'} />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center p-6 bg-zinc-800/30 rounded-xl">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Info className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-sm text-zinc-400">XRayMOD Panel</p>
              <p className="text-xs text-zinc-600 mt-1">Powered by Cloudflare Workers</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Password */}
        <Card>
          <CardHeader title="Change Password" />
          <div className="space-y-3">
            <div className="relative">
              <Input
                label="Current Password"
                type={showPass ? 'text' : 'password'}
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                placeholder="Enter current password"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-9 text-zinc-500 hover:text-zinc-300"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Input
              label="New Password"
              type={showPass ? 'text' : 'password'}
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="Minimum 6 characters"
            />
            <Input
              label="Confirm Password"
              type={showPass ? 'text' : 'password'}
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              placeholder="Confirm new password"
            />
            {passError && <p className="text-xs text-rose-500">{passError}</p>}
            {passSuccess && <p className="text-xs text-emerald-500">{passSuccess}</p>}
            <Button onClick={changePassword} size="sm">Change Password</Button>
          </div>
        </Card>

        {/* 2FA */}
        <Card>
          <CardHeader title="Two-Factor Authentication" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">2FA Status</p>
                <p className="text-xs text-zinc-500">{twoFAEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
              <StatusBadge status={twoFAEnabled ? 'Enabled' : 'Disabled'} variant={twoFAEnabled ? 'success' : 'default'} />
            </div>
            {!twoFAEnabled && !twoFASecret && (
              <Button variant="secondary" onClick={setup2FA} size="sm">Setup 2FA</Button>
            )}
            {twoFASecret && (
              <div className="p-3 bg-zinc-800/50 rounded-xl">
                <p className="text-xs text-zinc-400 mb-2">Scan this secret in your authenticator app:</p>
                <code className="text-xs font-mono text-emerald-500 break-all">{twoFASecret}</code>
                <Input
                  label="Verification Code"
                  value={twoFACode}
                  onChange={e => setTwoFACode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="mt-3"
                />
                <Button onClick={enable2FA} size="sm" className="mt-2">Enable 2FA</Button>
              </div>
            )}
            {twoFAEnabled && (
              <Button variant="danger" onClick={disable2FA} size="sm">Disable 2FA</Button>
            )}
          </div>
        </Card>
      </div>

      {/* Backup & Restore */}
      <Card>
        <CardHeader title="Backup & Restore" />
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={exportConfig}>
            <Download size={14} /> Export Config
          </Button>
          <Button variant="secondary" onClick={importConfig}>
            <Upload size={14} /> Import Config
          </Button>
          <Button variant="danger" onClick={resetConfig}>
            <Trash2 size={14} /> Reset to Defaults
          </Button>
        </div>
      </Card>

      {/* Update */}
      <Card>
        <CardHeader title="Update" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Update the worker to the latest version</p>
            <p className="text-xs text-zinc-500 mt-0.5">This will restart the service briefly</p>
          </div>
          <Button variant="secondary" onClick={selfUpdate}>
            <RefreshCw size={14} /> Check & Update
          </Button>
        </div>
      </Card>
    </div>
  );
}
