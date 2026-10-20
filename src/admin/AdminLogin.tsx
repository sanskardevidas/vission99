import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { api } from '../lib/api';
import { useAdmin } from './AdminAuth';

export default function AdminLogin() {
  const nav = useNavigate();
  const { me, loading, reload } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && me) nav('/admin/dashboard', { replace: true }); }, [me, loading, nav]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const r = await api('POST', '/api/admin/login', { email, password });
    if (!r.ok) { setBusy(false); setError(r.message); return; }
    await reload();
    setBusy(false);
    nav('/admin/dashboard', { replace: true });
  }

  const input = 'w-full min-h-[48px] rounded-xl border border-[#D9B66F]/60 bg-white pl-11 pr-4 text-sm text-[#101010] outline-none focus:border-[#D9B66F] focus:ring-2 focus:ring-[#D9B66F]/25';
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#101010] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-serif text-3xl font-extrabold tracking-wide text-[#D9B66F]">VISSION99 AQAAR</p>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/70">www.vission99.com</p>
        </div>
        <div className="rounded-2xl bg-[#F6F1E9] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)] sm:p-8">
          <h1 className="font-serif text-2xl font-bold text-[#101010]">Admin Portal</h1>
          <p className="mb-6 mt-1 text-sm text-[#292929]/75">Sign in with your administrator email and password.</p>
          <form onSubmit={submit} className="space-y-4" autoComplete="off">
            <label className="block text-sm font-medium text-[#292929]">Email Address
              <div className="relative mt-1">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a6b24]" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={input} autoComplete="username" />
              </div>
            </label>
            <label className="block text-sm font-medium text-[#292929]">Password
              <div className="relative mt-1">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a6b24]" />
                <input type={show ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className={`${input} pr-12`} autoComplete="current-password" />
                <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-[#292929]/70 hover:text-[#8a6b24]">
                  {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </label>
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={busy} className="min-h-[48px] w-full rounded-xl bg-[#D9B66F] font-semibold text-[#101010] transition hover:brightness-105 disabled:opacity-50">
              {busy ? 'Signing in…' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
