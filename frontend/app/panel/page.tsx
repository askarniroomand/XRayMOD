'use client';

import { useEffect, useState } from 'react';
import { Users, Server, Globe, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import type { User, Node } from '@/lib/types';

function StatCard({ title, value, sub, icon: Icon, color }: { title: string; value: string; sub: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-zinc-400">{title}</span>
        <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-zinc-500 mt-1">{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    api.get('/api/users').then(d => setUsers(d.data || [])).catch(() => {});
    api.get('/api/nodes').then(d => setNodes(d.data || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight">Overview</h1>
        <p className="text-zinc-500 mt-1">System health and performance at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={String(users.length)} sub="Active accounts" icon={Users} color="bg-emerald-500" />
        <StatCard title="Active Nodes" value={String(nodes.filter(n => n.status === 'online').length)} sub={`${nodes.length} total`} icon={Server} color="bg-blue-500" />
        <StatCard title="Total Traffic" value="4.2 TB" sub="Across all nodes" icon={Globe} color="bg-amber-500" />
        <StatCard title="Monthly Revenue" value="$1,240" sub="+8.4% growth" icon={TrendingUp} color="bg-emerald-500" />
      </div>

      {/* Node Performance */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Node Performance</h2>
        <div className="space-y-4">
          {nodes.slice(0, 3).map(node => (
            <div key={node.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                  <span className="font-bold text-sm">{node.name}</span>
                </div>
                <span className="text-xs font-mono text-zinc-500">{node.ip}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-[10px] uppercase text-zinc-500 mb-1">
                    <span>CPU</span><span>{node.cpu}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${node.cpu}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] uppercase text-zinc-500 mb-1">
                    <span>RAM</span><span>{node.ram}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${node.ram}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
