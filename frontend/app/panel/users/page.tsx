'use client';

import { useEffect, useState } from 'react';
import { Users as UsersIcon, Plus, Trash2, Copy, ExternalLink, Search, MoreVertical, Ban, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardHeader, Button, Input, StatusBadge, ProgressBar, DataTable, EmptyState } from '@/components';

interface User {
  id: string;
  username: string;
  email: string;
  uuid: string;
  traffic_limit: number;
  traffic_used: number;
  status: 'active' | 'expired' | 'disabled' | 'paused';
  expiry_date: string;
  created_at: number;
  enable: boolean;
  // Per-user settings
  speed_limit: number;
  sub_id: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Add form
  const [form, setForm] = useState({
    username: '',
    email: '',
    traffic_limit: 100,
    expiry_days: 30,
    enable: true,
  });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/users.json');
      setUsers(Array.isArray(data) ? data : []);
    } catch { setUsers([]); }
    setLoading(false);
  };

  const addUser = async () => {
    try {
      await api.post('/admin/users.json', { action: 'add', ...form });
      setShowAdd(false);
      setForm({ username: '', email: '', traffic_limit: 100, expiry_days: 30, enable: true });
      loadUsers();
    } catch {}
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.post('/admin/users.json', { action: 'delete', id });
      loadUsers();
    } catch {}
  };

  const toggleUser = async (id: string, enable: boolean) => {
    try {
      await api.post('/admin/users.json', { action: 'update', id, enable });
      loadUsers();
    } catch {}
  };

  const resetQuota = async (id: string) => {
    try {
      await api.post('/admin/user-reset', { id });
      loadUsers();
    } catch {}
  };

  const copySubLink = (user: User) => {
    const host = window.location.hostname;
    navigator.clipboard.writeText(`https://${host}/sub/${user.sub_id || user.id}`);
  };

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatBytes = (gb: number) => {
    if (gb >= 1024) return (gb / 1024).toFixed(1) + ' TB';
    return gb + ' GB';
  };

  const formatDate = (ts: number) => {
    if (!ts) return 'N/A';
    return new Date(ts * 1000).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Users</h1>
          <p className="text-zinc-500 text-sm mt-1">{users.length} total users</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full sm:w-48 pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <Button onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add User
          </Button>
        </div>
      </div>

      {/* Add User Form */}
      {showAdd && (
        <Card>
          <CardHeader title="Add New User" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="e.g. ali"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="user@example.com"
            />
            <Input
              label="Traffic Limit (GB)"
              type="number"
              value={form.traffic_limit}
              onChange={e => setForm({ ...form, traffic_limit: Number(e.target.value) })}
            />
            <Input
              label="Expiry (days)"
              type="number"
              value={form.expiry_days}
              onChange={e => setForm({ ...form, expiry_days: Number(e.target.value) })}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={addUser}>Create User</Button>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Users Table */}
      {loading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={UsersIcon}
            title={search ? 'No users found' : 'No users yet'}
            description={search ? 'Try a different search term.' : 'Add your first user to get started.'}
            action={!search ? <Button onClick={() => setShowAdd(true)}><Plus size={14} /> Add User</Button> : undefined}
          />
        </Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">User</th>
                  <th className="text-left px-5 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="text-left px-5 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Traffic</th>
                  <th className="text-left px-5 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Expiry</th>
                  <th className="text-right px-5 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                          {user.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{user.username}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{user.uuid?.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={user.enable !== false ? 'active' : 'disabled'} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                          <span>{formatBytes(user.traffic_used || 0)}</span>
                          <span>{formatBytes(user.traffic_limit)}</span>
                        </div>
                        <ProgressBar
                          value={user.traffic_used || 0}
                          max={user.traffic_limit || 1}
                          size="sm"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-zinc-400">
                      {formatDate(user.expiry_date as any)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => copySubLink(user)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-500 hover:bg-zinc-800 transition-colors"
                          title="Copy subscription link"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => toggleUser(user.id, user.enable === false)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-500 hover:bg-zinc-800 transition-colors"
                          title={user.enable !== false ? 'Disable' : 'Enable'}
                        >
                          {user.enable !== false ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </button>
                        <button
                          onClick={() => resetQuota(user.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-500 hover:bg-zinc-800 transition-colors"
                          title="Reset traffic quota"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-zinc-800 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
