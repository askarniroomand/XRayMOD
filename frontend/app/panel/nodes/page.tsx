'use client';

import { useEffect, useState } from 'react';
import { Server, Plus, Trash2, Cpu, Users as UsersIcon } from 'lucide-react';
import { api } from '@/lib/api';
import type { Node } from '@/lib/types';

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');

  useEffect(() => {
    api.get('/api/nodes').then((d) => setNodes(d?.data || [])).catch(() => setNodes([]));
  }, []);

  const addNode = async () => {
    const data = await api.post('/api/nodes', { name, ip });
    if (data.success) {
      setNodes([...nodes, data.data]);
      setShowAdd(false);
      setName('');
      setIp('');
    }
  };

  const deleteNode = async (id: number) => {
    await api.delete(`/api/nodes/${id}`);
    setNodes(nodes.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black">سرورها</h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded-xl text-sm">
          <Plus size={16} /> افزودن سرور
        </button>
      </div>

      {showAdd && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold">Add New Server</h3>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Server name" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
          <input value={ip} onChange={e => setIp(e.target.value)} placeholder="IP address" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
          <div className="flex gap-2">
            <button onClick={addNode} className="px-4 py-2 bg-emerald-600 text-black font-bold rounded-xl text-sm">Connect</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-zinc-800 text-zinc-400 rounded-xl text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {nodes.map(node => (
          <div key={node.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${node.status === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                <Server size={24} />
              </div>
              <div>
                <h3 className="font-bold">{node.name}</h3>
                <p className="text-xs font-mono text-zinc-500">{node.ip}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[10px] uppercase text-zinc-500 mb-1">CPU</p>
                <p className="font-mono text-sm">{node.cpu}%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase text-zinc-500 mb-1">Users</p>
                <p className="font-mono text-sm">{node.users}</p>
              </div>
              <button onClick={() => deleteNode(node.id)} className="text-zinc-500 hover:text-rose-500"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
