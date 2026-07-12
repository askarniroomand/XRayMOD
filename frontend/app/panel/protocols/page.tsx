'use client';

import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { api } from '@/lib/api';
import type { Protocol } from '@/lib/types';

export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);

  useEffect(() => {
    api.get('/api/protocols').then(d => setProtocols(d.data || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black">Protocols</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {protocols.map(p => (
          <div key={p.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-zinc-800 rounded-lg text-emerald-500">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-xs text-zinc-500">{p.schema?.fields?.length || 0} fields</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {(p.schema?.fields || []).map((f) => (
                <span key={f.name} className="text-[9px] px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-500 font-mono">
                  {f.name}:{f.type}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
