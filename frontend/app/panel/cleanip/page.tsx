'use client';

import { useState } from 'react';
import { Radar, Scan, Check } from 'lucide-react';
import { api } from '@/lib/api';

export default function CleanIPPage() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [isp, setIsp] = useState({ isp: '', asn: 0, country: '', carrier: '' });

  const scan = async () => {
    setScanning(true);
    try {
      const data = await api.get('/api/cleanip/scan?count=16');
      if (data.success) {
        setResults(data.data.ips);
        setIsp(data.data.isp);
      }
    } catch {}
    setScanning(false);
  };

  const apply = async () => {
    await api.post('/api/cleanip/apply', { ips: results });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black">Clean IP Scanner</h2>

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold flex items-center gap-2"><Radar size={18} className="text-emerald-500" /> ISP Detection</h3>
            <p className="text-xs text-zinc-500 mt-1">Your network info from Cloudflare</p>
          </div>
          <div className="flex gap-2">
            <button onClick={scan} disabled={scanning} className="flex items-center gap-2 px-4 py-2 border border-zinc-800 rounded-xl text-sm disabled:opacity-50">
              <Scan size={16} /> {scanning ? 'Scanning...' : 'Scan IPs'}
            </button>
            {results.length > 0 && (
              <button onClick={apply} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-black font-bold rounded-xl text-sm">
                <Check size={16} /> Apply
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'ISP', value: isp.isp || '---' },
            { label: 'ASN', value: isp.asn || '---' },
            { label: 'Country', value: isp.country || '---' },
            { label: 'Carrier', value: isp.carrier.toUpperCase() || '---' },
          ].map(item => (
            <div key={item.label} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</p>
              <p className="text-sm font-bold mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-bold mb-4">Scan Results ({results.length} IPs)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {results.map((ip, i) => (
              <div key={i} className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 text-sm font-mono">{ip}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
