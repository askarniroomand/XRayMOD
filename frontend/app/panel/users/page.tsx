'use client';

import { useEffect, useState } from 'react';
import { Users as UsersIcon, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', limit: 100, expiryDays: 30 });

  useEffect(() => {
    api.get('/api/users').then(d => setUsers(d.data || [])).catch(() => {});
  }, []);

  const addUser = async () => {
    const data = await api.post('/api/users', form);
    if (data.success) {
      api.get('/api/users').then(d => setUsers(d.data || []));
      setShowAdd(false);
      setForm({ username: '', email: '', limit: 100, expiryDays: 30 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black">Users</h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded-xl text-sm">
          <Plus size={16} /> New User
        </button>
      </div>

      {showAdd && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold">Add New User</h3>
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Username" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Data Limit (GB)</label>
              <input type="number" value={form.limit} onChange={e => setForm({ ...form, limit: Number(e.target.value) })} className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Expiry Days</label>
              <input type="number" value={form.expiryDays} onChange={e => setForm({ ...form, expiryDays: Number(e.target.value) })} className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addUser} className="px-4 py-2 bg-emerald-600 text-black font-bold rounded-xl text-sm">Create</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-zinc-800 text-zinc-400 rounded-xl text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-5 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">User</th>
              <th className="text-left px-5 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
              <th className="text-left px-5 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Usage</th>
              <th className="text-left px-5 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Expiry</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                      {user.username[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{user.username}</p>
                      <p className="text-[10px] text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                    user.status === 'expired' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-zinc-800 text-zinc-500'
                  }`}>{user.status.toUpperCase()}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="w-32">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                      <span>{user.used} GB</span><span>{user.limit} GB</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((user.used / user.limit) * 100, 100)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs font-mono text-zinc-400">{user.expiry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
