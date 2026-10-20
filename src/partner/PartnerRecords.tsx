import { ReactNode, useMemo, useState, useSyncExternalStore } from 'react';
import { CalendarCheck, Clock, Users, Plus, ArrowRight, X } from 'lucide-react';
import {
  Booking, PartnerRecord, PaymentType, SiteVisit, VisitStatus, allPartners, snapshot, subscribe,
} from './store';
import {
  CASH_LIMIT, PAYMENT_METHODS, PROJECTS, createBooking, createVisit, financeOf, recordsFor, submitPayment, updateVisitStatus,
} from './records';

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const todayIso = () => new Date().toISOString().slice(0, 10);

// ---------- Data hook ----------
export function useRecords(partner: PartnerRecord | null) {
  const snap = useSyncExternalStore(subscribe, snapshot, () => '');
  return useMemo(() => {
    if (!partner) return null;
    const r = recordsFor(partner);
    const all = allPartners();
    const roleOf = (id: string) => all.find(p => p.id === id)?.role;
    const verifiedOf = (b: Booking) => r.payments.filter(p => p.bookingId === b.id && p.status === 'Verified');
    let personal = 0, pp = 0, cp = 0;
    for (const c of r.customers) {
      if (c.booking.partnerId === partner.id) personal += c.fin.verified;
      else if (roleOf(c.booking.partnerId) === 'CP') cp += c.fin.verified;
      else pp += c.fin.verified;
    }
    // Monthly verified sales (in lakhs) for the last 6 months.
    const now = new Date();
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const row = { m: d.toLocaleString('en-IN', { month: 'short' }), key: d.getFullYear() * 12 + d.getMonth(), p: 0, pp: 0, cp: 0, t: 0 };
      return row;
    });
    for (const c of r.customers) {
      for (const pay of verifiedOf(c.booking)) {
        const d = new Date(pay.verifiedAt ?? pay.date);
        const row = monthly.find(x => x.key === d.getFullYear() * 12 + d.getMonth());
        if (!row) continue;
        const lakhs = pay.amount / 100000;
        if (c.booking.partnerId === partner.id) row.p += lakhs;
        else if (roleOf(c.booking.partnerId) === 'CP') row.cp += lakhs;
        else row.pp += lakhs;
        row.t += lakhs;
      }
    }
    const recent = r.customers
      .map(c => ({ ...c, last: verifiedOf(c.booking).map(p => p.verifiedAt ?? p.date).sort().pop() ?? '' }))
      .sort((a, b) => b.last.localeCompare(a.last))
      .slice(0, 5);
    return { ...r, sales: { total: personal + pp + cp, personal, pp, cp, plots: r.customers.length }, monthly, recent };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner, snap]);
}
export type Records = NonNullable<ReturnType<typeof useRecords>>;

// ---------- Small UI blocks (same look as the dashboards) ----------
function Card({ id, title, action, children }: { id?: string; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-[0_2px_16px_rgba(16,16,16,0.06)] transition-shadow duration-300 hover:shadow-[0_6px_24px_rgba(16,16,16,0.10)] md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-bold text-[#101010]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
function Btn({ children, onClick, outline = false, className = '', disabled = false, type = 'button' }: {
  children: ReactNode; onClick?: () => void; outline?: boolean; className?: string; disabled?: boolean; type?: 'button' | 'submit';
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-300 active:scale-[0.97] disabled:opacity-50 ${
        outline ? 'border border-[#D9B66F] text-[#101010] hover:bg-[#D9B66F]/15' : 'bg-[#D9B66F] text-[#101010] hover:brightness-105'
      } ${className}`}>{children}</button>
  );
}
function Pill({ status }: { status: string }) {
  const good = ['Fully Paid', 'Verified', 'Completed', 'Confirmed', 'Approved', 'Active'];
  const bad = ['Rejected', 'Cancelled'];
  const tone = good.includes(status) ? 'bg-emerald-50 text-emerald-700' : bad.includes(status) ? 'bg-red-50 text-red-600' : 'bg-[#D9B66F]/20 text-[#7A5A14]';
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}
function Empty({ text }: { text: string }) {
  return <p className="rounded-xl bg-[#F6F1E9]/60 px-4 py-6 text-center text-sm text-[#292929]/75">{text}</p>;
}
function Bar({ pct }: { pct: number }) {
  return <div className="h-2 w-full overflow-hidden rounded-full bg-[#F6F1E9]"><div className="h-full rounded-full bg-gradient-to-r from-[#D9B66F] to-[#e8cd92]" style={{ width: `${pct}%` }} /></div>;
}
function Tabs<T extends string>({ options, value, onChange }: { options: { key: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="max-w-full overflow-x-auto">
      <div className="inline-flex rounded-xl bg-[#F6F1E9] p-1">
        {options.map(o => (
          <button key={o.key} onClick={() => onChange(o.key)}
            className={`min-h-[36px] whitespace-nowrap rounded-lg px-3 text-xs font-semibold transition-colors duration-300 ${value === o.key ? 'bg-[#101010] text-[#D9B66F]' : 'text-[#292929]/70 hover:text-[#101010]'}`}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

const field = 'h-11 w-full rounded-xl border border-[#D9B66F]/40 bg-white px-4 text-sm outline-none transition-colors focus:border-[#D9B66F] disabled:bg-[#F6F1E9] disabled:text-[#292929]/70';
function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block text-sm font-medium text-[#292929]">{label}
      <div className="mt-1">{children}</div>
      {hint && <span className="mt-1 block text-xs font-normal text-[#6B6B6B]">{hint}</span>}
    </label>
  );
}
function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`max-h-[92vh] w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} overflow-y-auto rounded-t-2xl bg-[#F6F1E9] p-5 shadow-xl sm:rounded-2xl md:p-7`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#101010]">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-xl text-[#292929] hover:bg-white"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
const ErrorText = ({ text }: { text: string }) => (text ? <p className="text-sm text-red-600">{text}</p> : null);

// ---------- Site visit form ----------
function SiteVisitModal({ partner, onClose, onSaved }: { partner: PartnerRecord; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ customerName: '', mobile: '', email: '', project: PROJECTS[0], date: '', time: '', visitors: '1', notes: '' });
  const [error, setError] = useState('');
  const set = (k: keyof typeof f, v: string) => { setError(''); setF(p => ({ ...p, [k]: v })); };
  const submit = async () => {
    const r = await createVisit({ ...f, visitors: Number(f.visitors), email: f.email || undefined, notes: f.notes || undefined });
    if (!r.ok) return setError(r.error);
    onSaved(); onClose();
  };
  return (
    <Modal title="Add Site Visit" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Customer Full Name *"><input className={field} value={f.customerName} onChange={e => set('customerName', e.target.value)} /></Field>
        <Field label="Mobile Number *"><input className={field} inputMode="tel" value={f.mobile} onChange={e => set('mobile', e.target.value)} placeholder="10-digit mobile number" /></Field>
        <Field label="Email Address (optional)"><input className={field} type="email" value={f.email} onChange={e => set('email', e.target.value)} /></Field>
        <Field label="Project *">
          <select className={field} value={f.project} onChange={e => set('project', e.target.value)}>{PROJECTS.map(p => <option key={p}>{p}</option>)}</select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Visit Date *"><input className={field} type="date" min={todayIso()} value={f.date} onChange={e => set('date', e.target.value)} /></Field>
          <Field label="Preferred Time *"><input className={field} type="time" value={f.time} onChange={e => set('time', e.target.value)} /></Field>
        </div>
        <Field label="Number of Visitors *"><input className={field} type="number" min={1} value={f.visitors} onChange={e => set('visitors', e.target.value)} /></Field>
        <Field label="Notes (optional)"><textarea className={`${field} h-20 py-3`} value={f.notes} onChange={e => set('notes', e.target.value)} /></Field>
        <div className="grid grid-cols-3 gap-3 rounded-xl bg-white p-3 text-xs">
          <div><p className="text-[#6B6B6B]">Partner</p><p className="font-semibold text-[#101010]">{partner.name}</p></div>
          <div><p className="text-[#6B6B6B]">Partner ID</p><p className="font-semibold text-[#101010]">{partner.id}</p></div>
          <div><p className="text-[#6B6B6B]">Role</p><p className="font-semibold text-[#101010]">{partner.role}</p></div>
        </div>
        <ErrorText text={error} />
        <Btn className="w-full" onClick={submit}>Save Site Visit</Btn>
      </div>
    </Modal>
  );
}

// ---------- Payment sub-form (used in booking + add-payment) ----------
interface PayForm { type: PaymentType; amount: string; date: string; method: string; txnRef: string; receipt: string }
const blankPay = (type: PaymentType): PayForm => ({ type, amount: '', date: todayIso(), method: 'UPI', txnRef: '', receipt: '' });
function PaymentFields({ f, set, lockType }: { f: PayForm; set: (k: keyof PayForm, v: string) => void; lockType?: boolean }) {
  return (
    <div className="space-y-4">
      {!lockType && (
        <Field label="Payment Type">
          <select className={field} value={f.type} onChange={e => set('type', e.target.value)}>
            <option>Installment</option><option>Final Payment</option>
          </select>
        </Field>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount (₹) *"><input className={field} type="number" min={1} value={f.amount} onChange={e => set('amount', e.target.value)} /></Field>
        <Field label="Payment Date *"><input className={field} type="date" max={todayIso()} value={f.date} onChange={e => set('date', e.target.value)} /></Field>
      </div>
      <Field label="Payment Method *" hint={f.method === 'Cash' ? `Cash above ${inr(CASH_LIMIT)} is not permitted.` : undefined}>
        <select className={field} value={f.method} onChange={e => set('method', e.target.value)}>{PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}</select>
      </Field>
      <Field label="Transaction Reference Number *"><input className={field} value={f.txnRef} onChange={e => set('txnRef', e.target.value)} /></Field>
      <Field label="Payment Receipt (optional)">
        <input className={`${field} pt-2.5`} type="file" accept="image/*,.pdf" onChange={e => set('receipt', e.target.files?.[0]?.name ?? '')} />
      </Field>
      <p className="rounded-xl border border-dashed border-[#D9B66F] bg-white/60 px-3 py-2 text-xs text-[#7A5A14]">
        Payment Verification Status: <strong>Pending Verification</strong>. It counts toward the customer’s balance only after Admin verifies it.
      </p>
    </div>
  );
}

// ---------- Booking form ----------
function BookingModal({ partner, visit, onClose, onSaved }: { partner: PartnerRecord; visit?: SiteVisit; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    customerName: visit?.customerName ?? '', mobile: visit?.mobile ?? '', email: visit?.email ?? '', address: '',
    project: visit?.project ?? PROJECTS[0], plotNumber: '', area: '', rate: '', finalPrice: '', bookingDate: todayIso(),
  });
  const [pay, setPay] = useState<PayForm>(blankPay('Booking Advance'));
  const [withPay, setWithPay] = useState(true);
  const [error, setError] = useState('');
  const set = (k: keyof typeof f, v: string) => { setError(''); setF(p => ({ ...p, [k]: v })); };
  const setP = (k: keyof PayForm, v: string) => { setError(''); setPay(p => ({ ...p, [k]: v })); };
  const calc = Math.round((Number(f.area) || 0) * (Number(f.rate) || 0));
  const final = Number(f.finalPrice) || 0;
  const lower = final > 0 && calc > 0 && final < calc;
  const locked = !!visit;
  const submit = async () => {
    const r = await createBooking(
      { visitId: visit?.id, customerName: f.customerName, mobile: f.mobile, email: f.email || undefined, address: f.address || undefined,
        project: f.project, plotNumber: f.plotNumber, areaGuntha: Number(f.area), ratePerGuntha: Number(f.rate), finalPrice: final, bookingDate: f.bookingDate },
      withPay ? { type: 'Booking Advance', amount: Number(pay.amount), date: pay.date, method: pay.method, txnRef: pay.txnRef, receipt: pay.receipt || undefined } : undefined,
    );
    if (!r.ok) return setError(r.error);
    onSaved(); onClose();
  };
  const sec = 'mb-3 mt-6 border-b border-[#D9B66F]/40 pb-1 font-serif text-base font-bold text-[#101010]';
  return (
    <Modal title={visit ? 'Convert to Booking' : 'New Plot Booking'} onClose={onClose} wide>
      <h3 className={`${sec} !mt-0`}>1. Customer Information</h3>
      {locked && <p className="mb-3 text-xs text-[#7A5A14]">Carried over from site visit {visit!.ref}. These details are not re-entered.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Customer Full Name *"><input className={field} disabled={locked} value={f.customerName} onChange={e => set('customerName', e.target.value)} /></Field>
        <Field label="Mobile Number *"><input className={field} disabled={locked} value={f.mobile} onChange={e => set('mobile', e.target.value)} /></Field>
        <Field label="Email Address"><input className={field} disabled={locked} value={f.email} onChange={e => set('email', e.target.value)} /></Field>
        <Field label="Address (for booking documents)"><input className={field} value={f.address} onChange={e => set('address', e.target.value)} /></Field>
      </div>

      <h3 className={sec}>2. Property Information</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Project Name *">
          <select className={field} disabled={locked} value={f.project} onChange={e => set('project', e.target.value)}>{PROJECTS.map(p => <option key={p}>{p}</option>)}</select>
        </Field>
        <Field label="Plot Number *"><input className={field} value={f.plotNumber} onChange={e => set('plotNumber', e.target.value)} /></Field>
        <Field label="Land Area (Guntha) *"><input className={field} type="number" min={0} step="any" value={f.area} onChange={e => set('area', e.target.value)} /></Field>
        <Field label="Rate per Guntha (₹) *"><input className={field} type="number" min={0} value={f.rate} onChange={e => set('rate', e.target.value)} /></Field>
        <Field label="Calculated Plot Price"><input className={field} disabled value={calc ? inr(calc) : '—'} readOnly /></Field>
        <Field label="Final Agreed Plot Price (₹) *"><input className={field} type="number" min={0} value={f.finalPrice} onChange={e => set('finalPrice', e.target.value)} /></Field>
      </div>
      {lower && <p className="mt-3 rounded-xl bg-[#D9B66F]/20 px-3 py-2 text-xs text-[#7A5A14]">The final price is below the calculated price. This discount needs Admin approval; until approved, payments are tracked against {inr(calc)}.</p>}

      <h3 className={sec}>3. Booking Information</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Booking Date *"><input className={field} type="date" value={f.bookingDate} onChange={e => set('bookingDate', e.target.value)} /></Field>
        <Field label="Booking Reference Number"><input className={field} disabled value="Assigned on save" readOnly /></Field>
        <Field label="Booking Status"><input className={field} disabled value="Awaiting payment verification" readOnly /></Field>
        <Field label="Assigned Partner"><input className={field} disabled readOnly value={`${visit?.partnerName ?? partner.name} (${visit?.partnerId ?? partner.id}) · ${visit?.partnerRole ?? partner.role}`} /></Field>
      </div>
      <p className="mt-2 text-xs text-[#6B6B6B]">Sold directly by you — no Channel Partner needs to be assigned.</p>

      <h3 className={sec}>4. Payment Information</h3>
      <label className="mb-3 flex items-center gap-2 text-sm text-[#292929]">
        <input type="checkbox" className="h-4 w-4 accent-[#D9B66F]" checked={withPay} onChange={e => setWithPay(e.target.checked)} />Submit the booking advance now
      </label>
      {withPay && <PaymentFields f={pay} set={setP} lockType />}

      <div className="mt-5 space-y-3"><ErrorText text={error} /><Btn className="w-full" onClick={submit}>Save Booking</Btn></div>
    </Modal>
  );
}

function AddPaymentModal({ booking, remaining, onClose, onSaved }: { booking: Booking; remaining: number; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<PayForm>(blankPay('Installment'));
  const [error, setError] = useState('');
  const set = (k: keyof PayForm, v: string) => { setError(''); setF(p => ({ ...p, [k]: v })); };
  const submit = async () => {
    const r = await submitPayment(booking.id, { type: f.type, amount: Number(f.amount), date: f.date, method: f.method, txnRef: f.txnRef, receipt: f.receipt || undefined });
    if (!r.ok) return setError(r.error);
    onSaved(); onClose();
  };
  return (
    <Modal title={`Add Payment — ${booking.customerName}`} onClose={onClose}>
      <p className="mb-4 text-sm text-[#292929]/70">Plot {booking.plotNumber} · Remaining (unverified included): {inr(remaining)}</p>
      <PaymentFields f={f} set={set} />
      <div className="mt-5 space-y-3"><ErrorText text={error} /><Btn className="w-full" onClick={submit}>Submit for Verification</Btn></div>
    </Modal>
  );
}

// ---------- Sections ----------
type Scope = 'All' | 'Personal' | 'Team';

export function SiteVisitsSection({ partner, rec, showTeam, notify }: { partner: PartnerRecord; rec: Records; showTeam: boolean; notify?: (m: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [converting, setConverting] = useState<SiteVisit | null>(null);
  const [scope, setScope] = useState<Scope>('All');
  const [error, setError] = useState('');
  const today = todayIso();
  const open = (v: SiteVisit) => v.status === 'Scheduled' || v.status === 'Confirmed';
  const stats = [
    { label: 'Scheduled', value: rec.visits.filter(open).length },
    { label: 'Completed', value: rec.visits.filter(v => v.status === 'Completed').length },
    { label: 'Converted', value: rec.visits.filter(v => v.status === 'Converted to Booking').length },
    { label: 'Upcoming', value: rec.visits.filter(v => open(v) && v.date >= today).length },
  ];
  const list = rec.visits
    .filter(v => scope === 'All' || (scope === 'Personal') === (v.partnerId === partner.id))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const change = async (v: SiteVisit, s: VisitStatus) => { const r = await updateVisitStatus(v.id, s); if (!r.ok) setError(r.error); };

  return (
    <>
      <Card id="visits" title="Site Visits" action={<Btn onClick={() => setAdding(true)}><Plus size={16} />Add Site Visit</Btn>}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl bg-[#F6F1E9] p-4 text-center">
              <p className="font-serif text-2xl font-extrabold text-[#101010]">{s.value}</p>
              <p className="text-xs text-[#292929]/70">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[#101010]">Visits</h3>
          {showTeam && <Tabs options={(['All', 'Personal', 'Team'] as Scope[]).map(k => ({ key: k, label: k }))} value={scope} onChange={setScope} />}
        </div>
        <ErrorText text={error} />
        <div className="space-y-3">
          {list.length === 0 && <Empty text="No site visits scheduled." />}
          {list.map(v => {
            const mine = v.partnerId === partner.id;
            return (
              <div key={v.id} className="flex flex-col gap-3 rounded-xl border border-[#F6F1E9] p-4 transition-colors hover:border-[#D9B66F]/60">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-[#101010]">{v.customerName} <span className="text-xs font-normal text-[#6B6B6B]">· {v.ref}</span></p>
                    <p className="text-xs text-[#6B6B6B]">{v.project} · {v.mobile}{v.email ? ` · ${v.email}` : ''}</p>
                    <p className="text-xs text-[#6B6B6B]">Partner {v.partnerName} ({v.partnerId}) · {mine ? 'Personal' : 'Team'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-1.5"><CalendarCheck size={15} className="text-[#7A5A14]" />{fmt(v.date)}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock size={15} className="text-[#7A5A14]" />{v.time}</span>
                    <span className="inline-flex items-center gap-1.5"><Users size={15} className="text-[#7A5A14]" />{v.visitors} visitors</span>
                    <Pill status={v.status} />
                  </div>
                </div>
                {mine && v.status !== 'Converted to Booking' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <select aria-label="Update status" value={v.status} onChange={e => change(v, e.target.value as VisitStatus)}
                      className="h-10 rounded-xl border border-[#D9B66F]/40 bg-white px-3 text-xs font-semibold outline-none focus:border-[#D9B66F]">
                      {(['Scheduled', 'Confirmed', 'Completed', 'Cancelled'] as VisitStatus[]).map(s => <option key={s}>{s}</option>)}
                    </select>
                    {v.status !== 'Cancelled' && <Btn outline className="!min-h-[40px] !text-xs" onClick={() => setConverting(v)}>Convert to Booking<ArrowRight size={14} /></Btn>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-[#6B6B6B]">Site visits are separate from customers — a visitor appears under My Customers only after a verified plot payment.</p>
      </Card>
      {adding && <SiteVisitModal partner={partner} onClose={() => setAdding(false)} onSaved={() => notify?.('Site visit saved')} />}
      {converting && <BookingModal partner={partner} visit={converting} onClose={() => setConverting(null)} onSaved={() => notify?.('Booking created — awaiting payment verification')} />}
    </>
  );
}

export function BookingsSection({ partner, rec, notify }: { partner: PartnerRecord; rec: Records; notify?: (m: string) => void }) {
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState<{ b: Booking; remaining: number } | null>(null);
  const items = rec.bookings.filter(b => !b.cancelled).map(b => ({ b, fin: financeOf(b, rec.payments) })).reverse();
  return (
    <>
      <Card id="bookings" title="Plot Bookings" action={<Btn onClick={() => setCreating(true)}><Plus size={16} />New Plot Booking</Btn>}>
        <p className="-mt-3 mb-4 text-xs text-[#6B6B6B]">Bookings stay here until a payment is verified by Admin/Finance. Only then does the customer appear in My Customers.</p>
        {items.length === 0 && <Empty text="No plot bookings yet." />}
        <div className="space-y-3">
          {items.map(({ b, fin }) => {
            const mine = b.partnerId === partner.id;
            const room = Math.max(0, fin.approvedPrice - fin.mine.filter(p => p.status !== 'Rejected').reduce((s, p) => s + p.amount, 0));
            return (
              <div key={b.id} className="rounded-xl border border-[#F6F1E9] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#101010]">{b.customerName} <span className="text-xs font-normal text-[#6B6B6B]">· {b.ref}</span></p>
                    <p className="text-xs text-[#6B6B6B]">{b.project} · Plot {b.plotNumber} · {b.partnerName} ({b.partnerId})</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill status={fin.verified > 0 ? fin.status : 'Awaiting Verification'} />
                    {b.discountApproval === 'Pending Admin Approval' && <Pill status="Discount Pending Approval" />}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  <div><p className="text-[#6B6B6B]">Approved Price</p><p className="font-semibold">{inr(fin.approvedPrice)}</p></div>
                  <div><p className="text-[#6B6B6B]">Verified Paid</p><p className="font-semibold">{inr(fin.verified)}</p></div>
                  <div><p className="text-[#6B6B6B]">Pending Verification</p><p className="font-semibold">{inr(fin.pending)}</p></div>
                  <div><p className="text-[#6B6B6B]">Remaining</p><p className="font-semibold">{inr(fin.remaining)}</p></div>
                </div>
                {mine && room > 0 && <Btn outline className="mt-3 !min-h-[40px] !text-xs" onClick={() => setPaying({ b, remaining: room })}>Add Payment</Btn>}
              </div>
            );
          })}
        </div>
      </Card>
      {creating && <BookingModal partner={partner} onClose={() => setCreating(false)} onSaved={() => notify?.('Booking created — awaiting payment verification')} />}
      {paying && <AddPaymentModal booking={paying.b} remaining={paying.remaining} onClose={() => setPaying(null)} onSaved={() => notify?.('Payment submitted for verification')} />}
    </>
  );
}

export function CustomersSection({ partner, rec, tabs, showTeam, notify }: {
  partner: PartnerRecord; rec: Records; tabs?: { all: string; personal: string; team: string }; showTeam: boolean; notify?: (m: string) => void;
}) {
  const [scope, setScope] = useState<Scope>('All');
  const [open, setOpen] = useState<string | null>(null);
  const rows = rec.customers.filter(c => scope === 'All' || (scope === 'Personal') === (c.booking.partnerId === partner.id));
  const sel = rec.customers.find(c => c.booking.id === open);
  const labels = tabs ?? { all: 'All', personal: 'Personal', team: 'Team' };
  const heads = ['Customer', 'Mobile', 'Email', 'Project', 'Plot', 'Area (Guntha)', 'Final Price', 'Advance', 'Verified Paid', 'Balance', 'Progress', 'Status', 'Partner', 'Attribution'];
  return (
    <>
      <Card id="customers" title="My Customers">
        <div className="-mt-2 mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#6B6B6B]">Customers with at least one verified plot payment only.</p>
          {showTeam && <Tabs options={[{ key: 'All' as Scope, label: labels.all }, { key: 'Personal' as Scope, label: labels.personal }, { key: 'Team' as Scope, label: labels.team }]} value={scope} onChange={setScope} />}
        </div>
        {rows.length === 0 && <Empty text="No customers yet." />}
        {rows.length > 0 && (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1500px] text-left text-sm">
                <thead><tr className="border-b border-[#F6F1E9] text-xs uppercase tracking-wide text-[#6B6B6B]">{heads.map(h => <th key={h} className="pb-3 pr-4 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {rows.map(({ booking: b, fin }) => (
                    <tr key={b.id} onClick={() => setOpen(b.id)} className="cursor-pointer border-b border-[#F6F1E9] transition-colors last:border-0 hover:bg-[#F6F1E9]/50">
                      <td className="py-4 pr-4 font-semibold text-[#101010]">{b.customerName}</td>
                      <td className="pr-4">{b.mobile}</td>
                      <td className="pr-4">{b.email ?? '—'}</td>
                      <td className="whitespace-nowrap pr-4">{b.project}</td>
                      <td className="pr-4">{b.plotNumber}</td>
                      <td className="pr-4">{b.areaGuntha}</td>
                      <td className="pr-4">{inr(fin.approvedPrice)}</td>
                      <td className="pr-4">{inr(fin.advance)}</td>
                      <td className="pr-4">{inr(fin.verified)}</td>
                      <td className="pr-4">{inr(fin.remaining)}</td>
                      <td className="w-32 pr-4"><Bar pct={fin.progress} /><span className="text-xs text-[#6B6B6B]">{fin.progress}%</span></td>
                      <td className="pr-4"><Pill status={fin.status} /></td>
                      <td className="whitespace-nowrap pr-4">{b.partnerName} ({b.partnerId})</td>
                      <td className="whitespace-nowrap text-xs font-semibold text-[#7A5A14]">{b.partnerId === partner.id ? 'Personal Sale' : 'Team Sale'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 md:hidden">
              {rows.map(({ booking: b, fin }) => (
                <button key={b.id} onClick={() => setOpen(b.id)} className="block w-full rounded-xl bg-[#F6F1E9]/60 p-4 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="font-semibold text-[#101010]">{b.customerName}</p><p className="text-xs text-[#6B6B6B]">{b.project} · Plot {b.plotNumber}</p><p className="text-xs text-[#6B6B6B]">{b.mobile}</p></div>
                    <Pill status={fin.status} />
                  </div>
                  <div className="my-3"><Bar pct={fin.progress} /></div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><p className="text-[#6B6B6B]">Price</p><p className="font-semibold">{inr(fin.approvedPrice)}</p></div>
                    <div><p className="text-[#6B6B6B]">Paid</p><p className="font-semibold">{inr(fin.verified)}</p></div>
                    <div><p className="text-[#6B6B6B]">Balance</p><p className="font-semibold">{inr(fin.remaining)}</p></div>
                  </div>
                  <p className="mt-3 text-xs font-medium text-[#7A5A14]">{b.partnerName} ({b.partnerId}) · {b.partnerId === partner.id ? 'Personal Sale' : 'Team Sale'}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </Card>
      {sel && <CustomerDetail partner={partner} c={sel} onClose={() => setOpen(null)} notify={notify} />}
    </>
  );
}

function CustomerDetail({ partner, c, onClose, notify }: { partner: PartnerRecord; c: Records['customers'][number]; onClose: () => void; notify?: (m: string) => void }) {
  const { booking: b, fin } = c;
  const [paying, setPaying] = useState(false);
  const room = Math.max(0, fin.approvedPrice - fin.mine.filter(p => p.status !== 'Rejected').reduce((s, p) => s + p.amount, 0));
  const sum = [
    ['Final Approved Plot Price', inr(fin.approvedPrice)], ['Booking Advance', inr(fin.advance)],
    ['Total Verified Payments', inr(fin.verified)], ['Remaining Balance', inr(fin.remaining)],
  ];
  return (
    <Modal title={b.customerName} onClose={onClose} wide>
      <p className="mb-4 text-xs text-[#6B6B6B]">{b.mobile}{b.email ? ` · ${b.email}` : ''} · {b.project} · Plot {b.plotNumber} · {b.areaGuntha} Guntha · {b.ref}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {sum.map(([k, v]) => <div key={k} className="rounded-xl bg-white p-3"><p className="text-xs text-[#6B6B6B]">{k}</p><p className="font-serif text-base font-extrabold text-[#101010]">{v}</p></div>)}
      </div>
      <div className="mt-4"><Bar pct={fin.progress} /><p className="mt-1 text-xs text-[#6B6B6B]">Payment progress {fin.progress}% · {fin.status} · Partner {b.partnerName} ({b.partnerId})</p></div>
      <h3 className="mb-2 mt-6 font-serif text-base font-bold text-[#101010]">Payment History</h3>
      <div className="overflow-x-auto rounded-xl bg-white p-3">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead><tr className="border-b border-[#F6F1E9] uppercase tracking-wide text-[#6B6B6B]">
            {['Payment ID', 'Date', 'Type', 'Amount', 'Method', 'Reference', 'Status', 'Verified On'].map(h => <th key={h} className="pb-2 pr-3 font-semibold">{h}</th>)}
          </tr></thead>
          <tbody>
            {fin.mine.map(p => (
              <tr key={p.id} className="border-b border-[#F6F1E9] last:border-0">
                <td className="py-2 pr-3 font-semibold">{p.id}</td><td className="pr-3">{fmt(p.date)}</td><td className="pr-3">{p.type}</td>
                <td className="pr-3">{inr(p.amount)}</td><td className="pr-3">{p.method}</td><td className="pr-3">{p.txnRef}</td>
                <td className="pr-3"><Pill status={p.status} /></td><td>{p.verifiedAt ? fmt(p.verifiedAt) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-[#6B6B6B]">Upcoming installments: no payment schedule has been set for this booking.</p>
      {b.partnerId === partner.id && room > 0 && <Btn outline className="mt-4" onClick={() => setPaying(true)}>Add Payment</Btn>}
      {paying && <AddPaymentModal booking={b} remaining={room} onClose={() => setPaying(false)} onSaved={() => notify?.('Payment submitted for verification')} />}
    </Modal>
  );
}
