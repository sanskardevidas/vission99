import { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api';

export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
export const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const fmtDateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
export const fmtIst = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST' : '—';
export const ROLE_NAME: Record<string, string> = { CP: 'Channel Partner', PP: 'Project Partner', MG: 'Manager' };

// Fetch hook for admin GET endpoints.
export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setError('');
    api<T>('GET', path).then(r => {
      if (!live) return;
      if (r.ok) setData(r as unknown as T);
      else setError(r.message);
    });
    return () => { live = false; };
  }, [path, tick]);
  return { data, error, reload: () => setTick(t => t + 1) };
}

export function Page({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#101010] md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-[#292929]/75">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, action, children, className = '' }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#E8E0D2] bg-white p-5 shadow-[0_2px_14px_rgba(16,16,16,0.05)] ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="font-serif text-lg font-bold text-[#101010]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Kpi({ label, value, hint, dark = false }: { label: string; value: string; hint?: string; dark?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 shadow-[0_2px_14px_rgba(16,16,16,0.08)] ${dark ? 'bg-[#101010] text-white' : 'border border-[#E8E0D2] bg-white text-[#101010]'}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-[#D9B66F]' : 'text-[#7A5A14]'}`}>{label}</p>
      <p className="mt-2 font-serif text-2xl font-extrabold md:text-3xl">{value}</p>
      {hint && <p className={`mt-1 text-xs ${dark ? 'text-white/70' : 'text-[#292929]/70'}`}>{hint}</p>}
    </div>
  );
}

export function Pill({ text }: { text: string }) {
  const good = ['Verified', 'Confirmed', 'Active', 'Completed', 'Approved', 'Paid', 'Fully Paid'];
  const bad = ['Rejected', 'Cancelled', 'Inactive'];
  const tone = good.includes(text) ? 'bg-emerald-50 text-emerald-800' : bad.includes(text) ? 'bg-red-50 text-red-700' : 'bg-[#D9B66F]/25 text-[#6B4E10]';
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{text}</span>;
}

export function Empty({ text }: { text: string }) {
  return <p className="rounded-xl bg-[#F6F1E9] px-4 py-8 text-center text-sm text-[#292929]">{text}</p>;
}
export function Loading() { return <p className="py-10 text-center text-sm text-[#292929]/75">Loading…</p>; }
export function ErrorBox({ text }: { text: string }) {
  return text ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{text}</p> : null;
}

export function Btn({ children, onClick, variant = 'gold', disabled, type = 'button', small }: {
  children: ReactNode; onClick?: () => void; variant?: 'gold' | 'dark' | 'outline' | 'danger'; disabled?: boolean; type?: 'button' | 'submit'; small?: boolean;
}) {
  const v = {
    gold: 'bg-[#D9B66F] text-[#101010] hover:brightness-105',
    dark: 'bg-[#101010] text-[#D9B66F] hover:bg-[#292929]',
    outline: 'border border-[#D9B66F] text-[#101010] hover:bg-[#D9B66F]/15',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.97] disabled:opacity-50 ${small ? 'min-h-[36px] px-3 text-xs' : 'min-h-[44px] px-4 text-sm'} ${v}`}>
      {children}
    </button>
  );
}

export const inputCls = 'h-11 w-full rounded-xl border border-[#D9B66F]/50 bg-white px-4 text-sm text-[#101010] outline-none focus:border-[#D9B66F] focus:ring-2 focus:ring-[#D9B66F]/20';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-[#F6F1E9] p-5 shadow-xl sm:rounded-2xl md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#101010]">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-xl text-[#292929] hover:bg-white"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export interface Col<T> { head: string; cell: (r: T) => ReactNode; right?: boolean }
export function Table<T>({ cols, rows, empty, rowKey }: { cols: Col<T>[]; rows: T[]; empty: string; rowKey: (r: T) => string }) {
  if (!rows.length) return <Empty text={empty} />;
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#E8E0D2]">
            {cols.map(c => <th key={c.head} className={`whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#7A5A14] ${c.right ? 'text-right' : ''}`}>{c.head}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={rowKey(r)} className="border-b border-[#F1EBDF] text-[#101010] last:border-0 hover:bg-[#F6F1E9]/60">
              {cols.map(c => <td key={c.head} className={`px-3 py-3 align-top ${c.right ? 'text-right tabular-nums' : ''}`}>{c.cell(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DateRange({ from, to, onChange }: { from: string; to: string; onChange: (f: string, t: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-[#292929]">
      <label className="flex items-center gap-2">From<input type="date" className={`${inputCls} !h-10 w-auto`} value={from} max={to || undefined} onChange={e => onChange(e.target.value, to)} /></label>
      <label className="flex items-center gap-2">To<input type="date" className={`${inputCls} !h-10 w-auto`} value={to} min={from || undefined} onChange={e => onChange(from, e.target.value)} /></label>
      {(from || to) && <Btn small variant="outline" onClick={() => onChange('', '')}>Clear</Btn>}
    </div>
  );
}

// Simple, dependency-free grouped bar chart (values in rupees).
export function BarChart({ labels, series }: { labels: string[]; series: { name: string; color: string; values: number[] }[] }) {
  const W = 720, H = 240, pad = { l: 56, r: 8, t: 10, b: 28 };
  const max = Math.max(1, ...series.flatMap(s => s.values));
  const groupW = (W - pad.l - pad.r) / Math.max(1, labels.length);
  const barW = Math.min(22, (groupW - 8) / series.length);
  const fmt = (v: number) => v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr` : v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${Math.round(v / 1000)}K`;
  const ticks = [0, 0.5, 1].map(t => max * t);
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-[#292929]">
        {series.map(s => <span key={s.name} className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: s.color }} />{s.name}</span>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Monthly business overview chart">
        {ticks.map(t => {
          const y = pad.t + (H - pad.t - pad.b) * (1 - t / max);
          return <g key={t}><line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#E8E0D2" /><text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#292929">{fmt(t)}</text></g>;
        })}
        {labels.map((l, i) => {
          const x0 = pad.l + i * groupW + (groupW - barW * series.length) / 2;
          return (
            <g key={l}>
              {series.map((s, k) => {
                const h = (H - pad.t - pad.b) * (s.values[i] / max);
                return <rect key={s.name} x={x0 + k * barW} y={H - pad.b - h} width={barW - 2} height={Math.max(0, h)} rx="2" fill={s.color}><title>{`${l} · ${s.name}: ${inr(s.values[i])}`}</title></rect>;
              })}
              {(labels.length <= 12 || i % 2 === 0) && <text x={pad.l + i * groupW + groupW / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#292929">{l}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
