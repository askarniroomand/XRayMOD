'use client';

import { Wallet, Construction } from 'lucide-react';
import { Card } from '@/components';

export default function WalletPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-black tracking-tight">کیف پول</h1>
        <p className="text-zinc-500 text-sm mt-1">TON payments and withdrawals.</p>
      </div>
      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <Construction className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="font-bold text-lg mb-1">به‌زودی</h2>
          <p className="text-sm text-zinc-500 max-w-sm">
            اتصال کیف پول TON (payments, withdrawals, referral payouts) is planned for a later release.
            Enable <code className="text-emerald-400">ENABLE_TON_WALLET</code> when available.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-zinc-600">
            <Wallet size={14} />
            XRayMOD Financial Module
          </div>
        </div>
      </Card>
    </div>
  );
}
