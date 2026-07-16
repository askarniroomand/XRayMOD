'use client';

import { useState } from 'react';
import { Zap, Shield, Loader2, Eye, EyeOff, Lock, User } from 'lucide-react';
import { api } from '@/lib/api';
import { goPanel } from '@/lib/paths';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [totp, setTotp] = useState('');
  const [challenge, setChallenge] = useState<string | null>(null);
  const [require2fa, setRequire2fa] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setError('');

    try {
      const data =
        require2fa && challenge
          ? await api.post('/api/login', { challenge, totp })
          : await api.post('/api/login', {
              username: username.trim(),
              password,
              ...(totp ? { totp } : {}),
            });

      if (data?.require2fa && data?.challenge) {
        setRequire2fa(true);
        setChallenge(data.challenge);
        setError('');
        toast.message('کد Authenticator را وارد کنید');
        setLoading(false);
        return;
      }

      if (data?.success) {
        toast.success('ورود موفق');
        if (data.initialConfig) {
          try {
            sessionStorage.setItem('xraymod_initial', JSON.stringify(data.initialConfig));
          } catch { /* ignore */ }
        }
        // Full navigation keeps stealth UUID prefix (Next router would drop it)
        goPanel('/panel');
        return;
      }

      setError(data?.message || data?.error || 'نام کاربری یا رمز اشتباه است');
    } catch {
      setError('خطای شبکه — API در دسترس نیست');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[320px] h-[320px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative animate-fade-up">
        <div className="glass rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/50 border border-zinc-800/80">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-emerald-500/40 blur-xl rounded-2xl" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Zap className="w-8 h-8 text-black" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Xray<span className="text-emerald-400">MOD</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-2 text-center">
              {require2fa ? 'تأیید دو مرحله‌ای' : 'ورود به پنل مدیریت'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {!require2fa && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3.5 bg-zinc-950/90 border border-zinc-800 rounded-xl text-sm focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-700"
                      placeholder="admin"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full pl-10 pr-12 py-3.5 bg-zinc-950/90 border border-zinc-800 rounded-xl text-sm focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-700"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 p-1"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {require2fa && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                  <Shield size={12} className="text-emerald-500" />
                  Authenticator
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totp}
                  onChange={(e) => setTotp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoComplete="one-time-code"
                  autoFocus
                  className="w-full px-4 py-3.5 bg-zinc-950/90 border border-zinc-800 rounded-xl text-sm text-center tracking-[0.45em] font-mono focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="000000"
                  required
                />
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-sm text-rose-400 leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!require2fa && (!username.trim() || !password))}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:active:scale-100 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  در حال ورود...
                </>
              ) : require2fa ? (
                'تأیید و ادامه'
              ) : (
                'ورود'
              )}
            </button>

            {require2fa && (
              <button
                type="button"
                onClick={() => {
                  setRequire2fa(false);
                  setChallenge(null);
                  setTotp('');
                }}
                className="w-full text-xs text-zinc-500 hover:text-zinc-300 py-2"
              >
                ← بازگشت
              </button>
            )}
          </form>
        </div>

        <p className="text-center text-[11px] text-zinc-600 mt-6 leading-relaxed">
          پنل مخفی · Cloudflare Workers
          <br />
          <span className="text-zinc-700">Stealth access via UUID path</span>
        </p>
      </div>
    </div>
  );
}
