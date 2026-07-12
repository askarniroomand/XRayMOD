'use client';

import { Wallet } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black">Admin Wallet</h2>
        <span className="text-xs font-bold px-3 py-1 border border-zinc-700 text-zinc-500 rounded-full">External Server Required</span>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-4">
          <Wallet size={40} />
        </div>
        <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
        <p className="text-zinc-500 max-w-sm mx-auto text-sm">
          Connect your Tonkeeper or Telegram wallet to receive payments and manage finances.
        </p>
      </div>
    </div>
  );
}
