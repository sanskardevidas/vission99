import { FormEvent, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3, Building2, CalendarCheck, CreditCard, FileClock, LayoutDashboard, LogOut, Menu, Network, Settings,
  ShieldCheck, UserCog, Users, Wallet, X, Landmark,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAdmin } from './AdminAuth';
import { Btn, ErrorBox, inputCls } from './ui';

const BASE = '/admin/dashboard';
const NAV = [
  { label: 'Dashboard', to: BASE, icon: LayoutDashboard, end: true },
  { label: 'Partners & Hierarchy', to: `${BASE}/partners`, icon: Network },
  { label: 'Customers (Buyers)', to: `${BASE}/customers`, icon: Users },
  { label: 'Sales & Bookings', to: `${BASE}/bookings`, icon: Landmark },
  { label: 'Payment Verification', to: `${BASE}/payments`, icon: CreditCard },
  { label: 'Site Visits', to: `${BASE}/visits`, icon: CalendarCheck },
  { label: 'Projects & Plots', to: `${BASE}/projects`, icon: Building2 },
  { label: 'Commissions & Payouts', to: `${BASE}/commissions`, icon: Wallet },
  { label: 'Reports & Analytics', to: `${BASE}/reports`, icon: BarChart3 },
  { label: 'Audit Logs', to: `${BASE}/audit`, icon: FileClock },
  { label: 'User Management', to: `${BASE}/users`, icon: UserCog, superOnly: true },
  { label: 'Settings', to: `${BASE}/settings`, icon: Settings },
];

// First-login gate: the provisioned password must be replaced before anything else is usable.
function ChangePassword({ forced }: { forced?: boolean }) {
  const { reload } = useAdmin();
  const [cur, setCur] = useState(''); const [next, setNext] = useState(''); const [again, setAgain] = useState('');
  const [error, setError] = useState(''); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setDone(false);
    if (next !== again) return setError('New passwords do not match.');
    setBusy(true);
    const r = await api('POST', '/api/admin/change-password', { currentPassword: cur, newPassword: next });
    setBusy(false);
    if (!r.ok) return setError(r.message);
    setCur(''); setNext(''); setAgain(''); setDone(true);
    await reload();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      {forced && <p className="rounded-xl bg-[#D9B66F]/25 px-4 py-3 text-sm text-[#101010]">For security, you must set a new password before using the Admin Portal.</p>}
      <label className="block text-sm font-medium text-[#292929]">Current password<input type="password" className={`${inputCls} mt-1`} value={cur} onChange={e => setCur(e.target.value)} required autoComplete="current-password" /></label>
      <label className="block text-sm font-medium text-[#292929]">New password<input type="password" className={`${inputCls} mt-1`} value={next} onChange={e => setNext(e.target.value)} required autoComplete="new-password" />
        <span className="mt-1 block text-xs font-normal text-[#292929]/70">At least 10 characters with upper-case, lower-case and a number.</span></label>
      <label className="block text-sm font-medium text-[#292929]">Confirm new password<input type="password" className={`${inputCls} mt-1`} value={again} onChange={e => setAgain(e.target.value)} required autoComplete="new-password" /></label>
      <ErrorBox text={error} />
      {done && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Password updated.</p>}
      <Btn type="submit" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</Btn>
    </form>
  );
}
export { ChangePassword };

export default function AdminShell() {
  const { me, logout } = useAdmin();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  if (!me) return null;

  if (me.mustChangePassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101010] px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-[#F6F1E9] p-6 sm:p-8">
          <h1 className="mb-4 font-serif text-2xl font-bold text-[#101010]">Set a new password</h1>
          <ChangePassword forced />
          <button onClick={async () => { await logout(); nav('/admin/login'); }} className="mt-4 text-sm text-[#292929] underline">Log out</button>
        </div>
      </div>
    );
  }

  const links = NAV.filter(n => !n.superOnly || me.role === 'super_admin');
  const sidebar = (
    <div className="flex h-full flex-col bg-[#101010] p-5">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-serif text-lg font-extrabold tracking-wide text-[#D9B66F]">VISSION99 AQAAR</p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">Admin Portal</p>
        </div>
        <button className="text-white lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {links.map(({ label, to, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
            className={({ isActive }) => `flex min-h-[44px] items-center gap-3 rounded-xl px-4 text-sm font-medium transition ${isActive ? 'bg-[#D9B66F] text-[#101010]' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
            <Icon size={18} />{label}
          </NavLink>
        ))}
      </nav>
      <button onClick={async () => { await logout(); nav('/admin/login'); }}
        className="mt-4 flex min-h-[44px] items-center gap-3 rounded-xl px-4 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white">
        <LogOut size={18} />Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F1E9]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} /><div className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">{sidebar}</div></div>}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#E8E0D2] bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl text-[#101010] hover:bg-[#F6F1E9] lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button>
            <p className="font-serif text-lg font-bold text-[#101010]">Business Management</p>
          </div>
          <div className="flex items-center gap-2 text-right">
            <ShieldCheck size={18} className="text-[#8a6b24]" />
            <div className="leading-tight"><p className="text-sm font-semibold text-[#101010]">{me.name}</p><p className="text-xs text-[#292929]/70">{me.email}</p></div>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8"><Outlet /></main>
      </div>
    </div>
  );
}
