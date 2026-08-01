'use client';

import { useState } from 'react';
import { Zap, Shield, Loader2, Eye, EyeOff, Lock, User } from 'lucide-react';
import { api } from '@/lib/api';
import { goPanel } from '@/lib/paths';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
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
          } catch {
            /* ignore */
          }
        }
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
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="w-full max-w-[400px] relative page-shell">
        <div className="glass rounded-[1.35rem] p-7 sm:p-8 border border-[var(--stroke-strong)]">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-[var(--accent)]/25 blur-2xl rounded-2xl" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] rounded-2xl flex items-center justify-center">
                <Zap className="w-7 h-7 text-[#06140e]" strokeWidth={2.4} />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Xray<span className="text-[var(--accent)]">MOD</span>
            </h1>
            <p className="text-[var(--text-muted)] text-sm mt-2 text-center">
              {require2fa ? 'تأیید دو مرحله‌ای' : 'ورود امن به کنترل‌پلین'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {!require2fa && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.12em]">
                    Cloudflare email / username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3.5 bg-[var(--bg)] border border-[var(--stroke-strong)] rounded-[0.9rem] text-sm focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/15 transition-all placeholder:text-[var(--text-faint)]"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.12em]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full pl-10 pr-12 py-3.5 bg-[var(--bg)] border border-[var(--stroke-strong)] rounded-[0.9rem] text-sm focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/15 transition-all placeholder:text-[var(--text-faint)]"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text)] p-1"
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
                <label className="flex items-center gap-2 text-[11px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.12em]">
                  <Shield size={12} className="text-[var(--accent)]" />
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
                  className="w-full px-4 py-3.5 bg-[var(--bg)] border border-[var(--stroke-strong)] rounded-[0.9rem] text-sm text-center tracking-[0.4em] font-mono focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/15"
                  placeholder="000000"
                  required
                />
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-[rgba(240,113,120,0.08)] border border-[rgba(240,113,120,0.25)] rounded-[0.85rem] text-sm text-[var(--danger)] leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!require2fa && (!username.trim() || !password))}
              className="w-full py-3.5 bg-[var(--accent)] hover:brightness-110 active:scale-[0.99] disabled:bg-white/5 disabled:text-[var(--text-faint)] disabled:active:scale-100 text-[#06140e] font-semibold rounded-[0.9rem] transition-all flex items-center justify-center gap-2 shadow-[0_10px_28px_-14px_rgba(61,214,140,0.65)] mt-1"
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
                className="w-full text-xs text-[var(--text-faint)] hover:text-[var(--text-muted)] py-2"
              >
                بازگشت
              </button>
            )}
          </form>
        </div>

        <p className="text-center text-[11px] text-[var(--text-faint)] mt-6 leading-relaxed">
          SECURE PATH · private entry
          <br />
          Unauthorized requests return 404
        </p>
      </div>
    </div>
  );
}
