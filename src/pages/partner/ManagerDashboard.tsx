import { useState } from 'react';
import {
  LayoutDashboard, User, Users, CalendarCheck, TrendingUp, UsersRound, Wallet,
  Award, Building2, Megaphone, GraduationCap, LifeBuoy, Search, Bell, Copy,
  Check, Share2, MessageCircle, Menu, X, ArrowRight, Handshake,
  ShieldCheck, UserCheck, Crown, Briefcase, LogOut,
} from 'lucide-react';
import { useRecords, CustomersSection, SiteVisitsSection, BookingsSection } from '../../partner/PartnerRecords';
import { ROLE_LABEL, PartnerRecord, descendants } from '../../partner/store';
import { usePartnerSession, PromotionCelebration, initialsOf, fmtDate } from '../../partner/usePartnerSession';

// ---------- Business data: empty until real records exist ----------

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, target: 'welcome' },
  { label: 'My Profile', icon: User, target: 'partner-id' },
  { label: 'My Customers', icon: Users, target: 'customers' },
  { label: 'Site Visits', icon: CalendarCheck, target: 'visits' },
  { label: 'My Sales', icon: TrendingUp, target: 'sales' },
  { label: 'My Team', icon: UsersRound, target: 'team' },
  { label: 'PP Team (Direct)', icon: UserCheck, target: 'direct-pp' },
  { label: 'CP Team (All Levels)', icon: Handshake, target: 'cp-team' },
  { label: 'Commissions', icon: Wallet, target: 'commission' },
  { label: 'Promotion Progress', icon: Award, target: 'promotion' },
  { label: 'Projects', icon: Building2, target: 'projects' },
  { label: 'Marketing Materials', icon: Megaphone, target: null },
  { label: 'Training & Resources', icon: GraduationCap, target: null },
  { label: 'Help & Support', icon: LifeBuoy, target: null },
];
const BOTTOM_NAV = ['Dashboard', 'My Customers', 'Site Visits', 'My Sales'];

const PROJECT = 'DAS CITY — DIGHI PORT';
type SaleKind = 'Personal' | 'PP Team' | 'CP Team';
const COMM_SPLIT = [
  { label: 'Personal Sales Commission', value: '₹0', amt: 0, color: '#101010' },
  { label: 'PP Team Commission', value: '₹0', amt: 0, color: '#D9B66F' },
  { label: 'CP Team Commission', value: '₹0', amt: 0, color: '#8a6b24' },
];
const COMM_STATUS = [
  { label: 'Pending Approval', value: '₹0' },
  { label: 'Approved', value: '₹0' },
  { label: 'Paid', value: '₹0' },
];

const KYC_STATES = ['Not Submitted', 'In Progress', 'Under Review', 'KYC Verified', 'Rejected'];

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl bg-[#F6F1E9]/60 px-4 py-6 text-center text-sm text-[#292929]/75">{text}</p>;
}

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

// ---------- Small building blocks ----------
function Card({ id, title, action, children, className = '' }: {
  id?: string; title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 rounded-2xl ${className.includes('bg-[#101010]') ? '' : 'bg-white'} p-5 shadow-[0_2px_16px_rgba(16,16,16,0.06)] transition-shadow duration-300 hover:shadow-[0_6px_24px_rgba(16,16,16,0.10)] md:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className={`font-serif text-lg font-bold ${className.includes('bg-[#101010]') ? 'text-white' : 'text-[#101010]'}`}>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function GoldButton({ children, onClick, outline = false, className = '' }: {
  children: React.ReactNode; onClick?: () => void; outline?: boolean; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-300 active:scale-[0.97] ${
        outline
          ? 'border border-[#D9B66F] text-[#101010] hover:bg-[#D9B66F]/15'
          : 'bg-[#D9B66F] text-[#101010] hover:brightness-105'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const good = ['Fully Paid', 'Active', 'Completed', 'Converted', 'KYC Verified'];
  const tone = good.includes(status)
    ? 'bg-emerald-50 text-emerald-700'
    : status === 'Inactive'
      ? 'bg-stone-100 text-stone-500'
      : 'bg-[#D9B66F]/20 text-[#7A5A14]';
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

function Segmented<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-xl bg-[#F6F1E9] p-1">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold transition-colors duration-300 ${
            value === o ? 'bg-[#101010] text-[#D9B66F]' : 'text-[#292929]/70 hover:text-[#101010]'
          }`}
        >{o}</button>
      ))}
    </div>
  );
}

type View = 'Total' | 'Personal' | 'PP Team' | 'CP Team';
const SEG_COLORS = { p: '#101010', pp: '#D9B66F', cp: '#8a6b24' };
function SalesChart({ view, data }: { view: View; data: { m: string; p: number; pp: number; cp: number }[] }) {
  const peak = Math.max(0.5, ...data.map(d => (view === 'Total' || view === 'Personal' ? d.p : 0) + (view === 'Total' || view === 'PP Team' ? d.pp : 0) + (view === 'Total' || view === 'CP Team' ? d.cp : 0)));
  const max = Math.ceil(peak * 1.1 * 2) / 2;
  const W = 360, H = 170, pad = 28;
  const bw = (W - pad * 2) / data.length;
  const scale = (v: number) => (v / max) * (H - 10);
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" role="img" aria-label="Monthly sales in lakhs (sample)">
      {[0, max / 2, max].map(t => {
        const y = H - scale(t);
        return (
          <g key={t}>
            <line x1={pad} x2={W - pad} y1={y} y2={y} stroke="#F6F1E9" strokeWidth="1" />
            <text x={0} y={y + 3} fontSize="9" fill="#6B6B6B">{Number(t.toFixed(1))}L</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = pad + i * bw + bw * 0.2;
        const w = bw * 0.6;
        const ph = view === 'Total' || view === 'Personal' ? scale(d.p) : 0;
        const pph = view === 'Total' || view === 'PP Team' ? scale(d.pp) : 0;
        const cph = view === 'Total' || view === 'CP Team' ? scale(d.cp) : 0;
        return (
          <g key={d.m}>
            {ph > 0 && <rect x={x} y={H - ph} width={w} height={ph} rx="3" fill={SEG_COLORS.p} />}
            {pph > 0 && <rect x={x} y={H - ph - pph} width={w} height={pph} rx="3" fill={SEG_COLORS.pp} />}
            {cph > 0 && <rect x={x} y={H - ph - pph - cph} width={w} height={cph} rx="3" fill={SEG_COLORS.cp} />}
            <text x={x + w / 2} y={H + 16} fontSize="10" textAnchor="middle" fill="#292929">{d.m}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Donut() {
  const total = COMM_SPLIT.reduce((s, c) => s + c.amt, 0) || 1;
  const r = 52, C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 140 140" className="mx-auto h-40 w-40" role="img" aria-label="Commission split (sample)">
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="18" />
      {COMM_SPLIT.map(c => {
        const len = (c.amt / total) * C;
        const el = (
          <circle key={c.label} cx="70" cy="70" r={r} fill="none" stroke={c.color === '#101010' ? '#F6F1E9' : c.color} strokeWidth="18"
            strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)" />
        );
        offset += len;
        return el;
      })}
      <text x="70" y="67" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)">Total</text>
      <text x="70" y="82" textAnchor="middle" fontSize="12" fontWeight="700" fill="#D9B66F">₹0</text>
    </svg>
  );
}

// ---------- Page ----------
export default function ManagerDashboard() {
  const [active, setActive] = useState('Dashboard');
  const [drawer, setDrawer] = useState(false);
  const [copied, setCopied] = useState<'id' | 'link' | null>(null);
  const [notice, setNotice] = useState('');
  const [view, setView] = useState<View>('Total');
  const { partner, data, signOut } = usePartnerSession('MG');
  const rec = useRecords(partner);
  if (!partner || !data || !rec) return null;
  const PARTNER = { name: partner.name, id: partner.id, role: ROLE_LABEL[partner.role] + ' (MG)' };
  const REFERRAL_LINK = data.link;
  const KYC_CURRENT = partner.kycStatus;
  const byId = new Map<string, PartnerRecord>(data.team.map(t => [t.id, t]));
  // Nearest Project Partner above a Channel Partner, within this Manager's team.
  const associatedPP = (cp: PartnerRecord) => {
    let cur = cp.referredBy ? byId.get(cp.referredBy) : undefined;
    while (cur && cur.role === 'CP') cur = cur.referredBy ? byId.get(cur.referredBy) : undefined;
    return cur ? `${cur.name} (${cur.id})` : 'Direct to Manager';
  };
  const SUMMARY = [
    { label: 'Total Team Sales', value: inr(rec.sales.total), icon: TrendingUp },
    { label: 'Total Commission', value: '₹0', icon: Wallet },
    { label: 'My Customers', value: String(rec.customers.length), icon: Users },
    { label: 'Site Visits', value: String(rec.visits.length), icon: CalendarCheck },
    { label: 'My PP Team', value: String(data.directPP.length), icon: UserCheck },
    { label: 'My CP Team (Total)', value: String(data.allCP.length), icon: UsersRound },
  ];

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(''), 2200); };

  const go = (label: string, target: string | null) => {
    setActive(label);
    setDrawer(false);
    if (target) document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else flash(`${label} — preview only`);
  };

  const copy = async (text: string, kind: 'id' | 'link') => {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
    setCopied(kind);
    setTimeout(() => setCopied(null), 1800);
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Join VISSION99 AQAAR', url: REFERRAL_LINK }); } catch { /* cancelled */ }
    } else {
      copy(REFERRAL_LINK, 'link');
    }
  };

  const roleOfId = new Map(data.team.map(t => [t.id, t.role]));
  const kindOf = (id: string): SaleKind => (id === partner.id ? 'Personal' : roleOfId.get(id) === 'CP' ? 'CP Team' : 'PP Team');
  const sales = rec.recent
    .map(c => ({ customer: c.booking.customerName, plot: c.booking.plotNumber, value: c.fin.verified, date: fmtDate(c.last), kind: kindOf(c.booking.partnerId), pid: c.booking.partnerId }))
    .filter(s => view === 'Total' || s.kind === view);

  const NavList = ({ onDark = true }: { onDark?: boolean }) => (
    <nav className="space-y-1">
      {NAV.map(({ label, icon: Icon, target }) => {
        const on = active === label;
        return (
          <button
            key={label}
            onClick={() => go(label, target)}
            title={label}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors duration-300 lg:px-4 ${
              on ? 'bg-[#D9B66F] text-[#101010]' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={19} className="shrink-0" />
            <span className={onDark ? 'hidden lg:inline' : ''}>{label}</span>
          </button>
        );
      })}
    </nav>
  );

  const kindTone = (k: SaleKind) =>
    k === 'Personal' ? 'bg-[#101010] text-[#D9B66F]' : k === 'PP Team' ? 'bg-[#D9B66F]/25 text-[#7A5A14]' : 'border border-[#8a6b24]/50 text-[#7A5A14]';

  return (
    <div className="min-h-screen bg-[#F6F1E9] font-sans text-[#292929]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col bg-[#101010] p-3 md:flex lg:w-64 lg:p-4">
        <div className="mb-8 px-1 pt-3 text-center lg:px-3 lg:text-left">
          <p className="font-serif text-sm font-extrabold tracking-wide text-[#D9B66F] lg:text-lg">
            <span className="lg:hidden">V99</span><span className="hidden lg:inline">VISSION99 AQAAR</span>
          </p>
        </div>
        <div className="flex-1 overflow-y-auto"><NavList /></div>
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-[#101010] p-4">
            <div className="mb-6 flex items-center justify-between px-2 pt-2">
              <p className="font-serif text-lg font-extrabold text-[#D9B66F]">VISSION99 AQAAR</p>
              <button onClick={() => setDrawer(false)} className="flex h-11 w-11 items-center justify-center text-white" aria-label="Close menu"><X size={22} /></button>
            </div>
            <NavList onDark={false} />
          </div>
        </div>
      )}

      <div className="md:pl-[76px] lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#D9B66F]/20 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <button onClick={() => setDrawer(true)} className="flex h-11 w-11 items-center justify-center rounded-xl text-[#101010] md:hidden" aria-label="Open menu"><Menu size={22} /></button>
          <p className="font-serif text-base font-extrabold tracking-wide text-[#101010] md:hidden">VISSION<span className="text-[#D9B66F]">99</span></p>
          <p className="hidden font-serif text-base font-extrabold tracking-wide text-[#101010] md:block lg:hidden">VISSION<span className="text-[#D9B66F]">99</span> AQAAR</p>
          <div className="relative ml-auto hidden max-w-md flex-1 sm:block">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
            <input
              placeholder="Search customers, plots, visits…"
              className="h-11 w-full rounded-xl border border-transparent bg-[#F6F1E9] pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#D9B66F]"
            />
          </div>
          <button className="relative ml-auto flex h-11 w-11 items-center justify-center rounded-xl text-[#292929] transition-colors hover:bg-[#F6F1E9] sm:ml-0" aria-label="Notifications">
            <Bell size={20} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#D9B66F]" />
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight lg:block">
              <p className="text-sm font-semibold text-[#101010]">{PARTNER.name}</p>
              <p className="text-xs text-[#6B6B6B]">{PARTNER.role} · {PARTNER.id}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#101010] text-sm font-bold text-[#D9B66F] ring-2 ring-[#D9B66F]">{initialsOf(partner.name)}</div>
            <button onClick={signOut} className="flex h-10 w-10 items-center justify-center rounded-xl text-[#292929] transition-colors hover:bg-[#F6F1E9]" aria-label="Log out" title="Log out"><LogOut size={18} /></button>
          </div>
        </header>

        <main className="space-y-6 px-4 py-6 pb-28 md:px-8 md:pb-10">
          {/* Welcome */}
          <section id="welcome" className="relative scroll-mt-24 overflow-hidden rounded-2xl bg-[#101010] p-6 text-white md:p-10">
            <img
              src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1400"
              alt="" className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#101010] via-[#101010]/70 to-[#D9B66F]/40" />
            <div className="relative">
              <h1 className="font-serif text-2xl font-extrabold md:text-4xl">Good Morning, {PARTNER.name}!</h1>
              <p className="mt-2 text-sm text-white/80 md:text-base">Role: {PARTNER.role} | Partner ID: {PARTNER.id}</p>
              <p className="mt-6 text-lg font-semibold text-[#D9B66F] md:text-xl">स्वप्न तुमचे, दिशा आमची</p>
            </div>
          </section>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
            {SUMMARY.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(16,16,16,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(16,16,16,0.12)] md:p-5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9B66F]/20 text-[#7A5A14]"><Icon size={20} /></div>
                <p className="text-xs font-medium text-[#6B6B6B]">{label}</p>
                <p className="mt-1 break-words font-serif text-lg font-extrabold text-[#101010] md:text-xl">{value}</p>
              </div>
            ))}
          </div>
          <p className="-mt-3 text-xs text-[#6B6B6B]">My Customers counts verified plot payments only — no enquiries or unpaid bookings. PP and CP team figures are shown separately.</p>

          {/* ID + Referral */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card id="partner-id" className="border border-[#D9B66F]/40">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#7A5A14]">Your Manager ID</p>
              <p className="mt-2 font-serif text-2xl font-extrabold text-[#7A5A14] md:text-3xl">{PARTNER.id}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#292929]/80">
                Customers can enter this ID during plot booking when you personally bring them. Once VISSION99 verifies the payment, the sale is attributed directly to you — no Channel Partner or Project Partner is required.
              </p>
              <GoldButton className="mt-5" onClick={() => copy(PARTNER.id, 'id')}>
                {copied === 'id' ? <Check size={16} /> : <Copy size={16} />}{copied === 'id' ? 'Copied!' : 'Copy ID'}
              </GoldButton>
            </Card>

            <Card title="Your Referral Link">
              <p className="break-all rounded-xl bg-[#F6F1E9] px-4 py-3 text-sm text-[#101010]">{REFERRAL_LINK}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#292929]/80">
                This link is for partner registrations only. It is separate from your Manager ID, which is used to attribute direct plot purchases.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <GoldButton onClick={() => copy(REFERRAL_LINK, 'link')}>
                  {copied === 'link' ? <Check size={16} /> : <Copy size={16} />}{copied === 'link' ? 'Copied!' : 'Copy Referral Link'}
                </GoldButton>
                <GoldButton outline onClick={share}><Share2 size={16} />Share Link</GoldButton>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent('Join my team at VISSION99 AQAAR: ' + REFERRAL_LINK)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#D9B66F] px-4 text-sm font-semibold text-[#101010] transition-all duration-300 hover:bg-[#D9B66F]/15 active:scale-[0.97]"
                ><MessageCircle size={16} />WhatsApp</a>
              </div>
            </Card>
          </div>

          <CustomersSection partner={partner} rec={rec} tabs={{ all: 'All Customers', personal: 'My Customers (Personal)', team: 'Team Customers' }} showTeam={true} notify={flash} />

          <SiteVisitsSection partner={partner} rec={rec} showTeam={true} notify={flash} />

          <BookingsSection partner={partner} rec={rec} notify={flash} />

          {/* Sales + Commission */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card id="sales" title="Sales Overview" className="lg:col-span-2" action={
              <div className="max-w-full overflow-x-auto"><Segmented options={['Total', 'Personal', 'PP Team', 'CP Team'] as View[]} value={view} onChange={setView} /></div>
            }>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="rounded-xl bg-[#101010] p-4"><p className="text-xs text-white/60">Personal Sales</p><p className="font-serif text-lg font-extrabold text-[#D9B66F]">{inr(rec.sales.personal)}</p></div>
                <div className="rounded-xl bg-[#F6F1E9] p-4"><p className="text-xs text-[#292929]/70">PP Team Sales</p><p className="font-serif text-lg font-extrabold text-[#101010]">{inr(rec.sales.pp)}</p></div>
                <div className="rounded-xl bg-[#F6F1E9] p-4"><p className="text-xs text-[#292929]/70">CP Team Sales</p><p className="font-serif text-lg font-extrabold text-[#101010]">{inr(rec.sales.cp)}</p></div>
                <div className="rounded-xl bg-[#F6F1E9] p-4"><p className="text-xs text-[#292929]/70">Total Sales</p><p className="font-serif text-lg font-extrabold text-[#101010]">{inr(rec.sales.total)}</p></div>
                <div className="col-span-2 rounded-xl bg-[#F6F1E9] p-4 sm:col-span-1"><p className="text-xs text-[#292929]/70">Plots Sold</p><p className="font-serif text-lg font-extrabold text-[#101010]">{rec.sales.plots}</p></div>
              </div>
              <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-[#292929]/70">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#101010]" />Personal (direct)</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#D9B66F]" />PP Team</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#8a6b24]" />CP Team</span>
              </div>
              <p className="mb-2 text-xs text-[#6B6B6B]">Personal sales are made independently of your team. Total counts each unique verified sale once; CP Team excludes sales already in PP Team totals.</p>
              <SalesChart view={view} data={rec.monthly} />
              <h3 className="mb-3 mt-5 text-sm font-semibold text-[#101010]">Recent Verified Sales</h3>
              {sales.length === 0 && <Empty text="No sales recorded yet." />}
              <div className="divide-y divide-[#F6F1E9]">
                {sales.map(s => (
                  <div key={s.plot} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div><p className="font-semibold text-[#101010]">{s.customer}</p><p className="text-xs text-[#6B6B6B]">Plot {s.plot} · {s.pid} · {s.date}</p></div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${kindTone(s.kind)}`}>{s.kind}</span>
                      <p className="font-semibold">{inr(s.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card id="commission" title="Commission Overview" className="bg-[#101010] text-white">
              <Donut />
              <p className="mt-4 text-center text-xs text-white/60">Total Commission</p>
              <p className="text-center font-serif text-3xl font-extrabold text-[#D9B66F]">₹0</p>
              <div className="mt-5 space-y-3">
                {COMM_SPLIT.map(c => (
                  <div key={c.label} className="flex items-center justify-between gap-3 rounded-xl bg-[#D9B66F]/15 px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-2 text-white/80">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color === '#101010' ? '#F6F1E9' : c.color }} />{c.label}
                    </span>
                    <span className="font-semibold text-[#D9B66F]">{c.value}</span>
                  </div>
                ))}
                <div className="my-1 border-t border-white/10" />
                {COMM_STATUS.map(c => (
                  <div key={c.label} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm">
                    <span className="text-white/70">{c.label}</span><span className="font-semibold">{c.value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-white/65">
                No commission history available. Figures exclude partner registration fees.
              </p>
            </Card>
          </div>

          {/* Team structure */}
          <Card id="team" title="Team Structure" action={<GoldButton outline onClick={() => flash('View Full Team — preview only')}>View Full Team</GoldButton>}>
            <div className="mb-5 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <div className="rounded-xl bg-[#F6F1E9] p-3"><p className="font-serif text-xl font-extrabold text-[#101010]">{data.directPP.length}</p><p className="text-xs text-[#292929]/70">Direct Project Partners</p></div>
              <div className="rounded-xl bg-[#F6F1E9] p-3"><p className="font-serif text-xl font-extrabold text-[#101010]">{data.allCP.length}</p><p className="text-xs text-[#292929]/70">Channel Partners (all levels)</p></div>
              <div className="rounded-xl bg-[#F6F1E9] p-3"><p className="font-serif text-xl font-extrabold text-[#101010]">{data.team.length}</p><p className="text-xs text-[#292929]/70">Total Team Members</p></div>
              <div className="rounded-xl bg-[#F6F1E9] p-3"><p className="font-serif text-xl font-extrabold text-[#7A5A14]">Manager</p><p className="text-xs text-[#292929]/70">Current Role</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[#101010] p-4 text-white">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D9B66F] font-bold text-[#101010]">{initialsOf(partner.name)}</div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{PARTNER.name}</p>
                <p className="text-xs text-white/60">Manager · {PARTNER.id} · Direct sales + {data.team.length} team members</p>
              </div>
              <StatusPill status="Active" />
            </div>
            {data.direct.length === 0 ? (
              <div className="mt-4"><Empty text="No team members yet. Share your referral link to get started." /></div>
            ) : (
              <ul className="ml-5 space-y-3 border-l-2 border-[#D9B66F]/50 pb-1 pt-4">
                {data.direct.map(pp => {
                  const kids = data.team.filter(c => c.referredBy === pp.id);
                  const size = descendants(data.team, pp.id).length;
                  return (
                    <li key={pp.id} className="relative pl-5">
                      <span className="absolute left-0 top-6 h-0.5 w-4 bg-[#D9B66F]/50" />
                      <div className="flex items-center gap-3 rounded-xl bg-[#F6F1E9]/60 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#101010] text-sm font-bold text-[#D9B66F]">{initialsOf(pp.name)}</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#101010]">{pp.name}</p>
                          <p className="text-xs text-[#6B6B6B]">{ROLE_LABEL[pp.role]} · {pp.id} · Reports to {PARTNER.id}</p>
                        </div>
                        <span className="hidden text-xs font-medium text-[#7A5A14] sm:inline">{size} in team</span>
                        <StatusPill status={pp.status} />
                      </div>
                      {kids.length > 0 && (
                        <ul className="ml-5 mt-2 space-y-2 border-l-2 border-[#D9B66F]/30">
                          {kids.slice(0, 2).map(c => (
                            <li key={c.id} className="relative pl-5">
                              <span className="absolute left-0 top-1/2 h-0.5 w-4 bg-[#D9B66F]/30" />
                              <div className="flex items-center gap-3 rounded-lg border border-[#F6F1E9] bg-white p-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D9B66F]/25 text-xs font-bold text-[#7A5A14]">{initialsOf(c.name)}</div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-[#101010]">{c.name}</p>
                                  <p className="text-xs text-[#6B6B6B]">{ROLE_LABEL[c.role]} · {c.id}</p>
                                </div>
                                <StatusPill status={c.status} />
                              </div>
                            </li>
                          ))}
                          {size > 2 && (
                            <li className="relative pl-5 text-xs text-[#7A5A14]">
                              <span className="absolute left-0 top-1/2 h-0.5 w-4 bg-[#D9B66F]/30" />
                              + {size - 2} other team members
                            </li>
                          )}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Direct PP + CP team */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card id="direct-pp" title="My Direct PP Team" action={<GoldButton outline onClick={() => flash('View All — preview only')}>View All</GoldButton>}>
              {data.directPP.length === 0 && <Empty text="No team members yet. Share your referral link to get started." />}
              <div className={`${data.directPP.length === 0 ? 'hidden' : ''} overflow-x-auto`}>
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#F6F1E9] text-xs uppercase tracking-wide text-[#6B6B6B]">
                      {['Partner', 'Partner ID', 'Role', 'Joined', 'Team', 'Status'].map(h => <th key={h} className="pb-3 pr-4 font-semibold">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {data.directPP.map(p => (
                      <tr key={p.id} className="border-b border-[#F6F1E9] last:border-0 transition-colors hover:bg-[#F6F1E9]/50">
                        <td className="py-3 pr-4 font-semibold text-[#101010]">{p.name}</td>
                        <td className="pr-4">{p.id}</td>
                        <td className="whitespace-nowrap pr-4">Project Partner</td>
                        <td className="whitespace-nowrap pr-4">{fmtDate(p.joinedAt)}</td>
                        <td className="pr-4">{descendants(data.team, p.id).length}</td>
                        <td><StatusPill status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card id="cp-team" title="My CP Team (All Levels)" action={<GoldButton outline onClick={() => flash('View All — preview only')}>View All</GoldButton>}>
              <p className="-mt-2 mb-4 text-xs text-[#6B6B6B]">Total Channel Partners: <span className="font-semibold text-[#101010]">{data.allCP.length}</span> · Reporting overview only</p>
              {data.allCP.length === 0 && <Empty text="No team members yet. Share your referral link to get started." />}
              <div className={`${data.allCP.length === 0 ? 'hidden' : ''} overflow-x-auto`}>
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#F6F1E9] text-xs uppercase tracking-wide text-[#6B6B6B]">
                      {['Partner', 'Partner ID', 'Project Partner', 'Joined', 'Status'].map(h => <th key={h} className="pb-3 pr-4 font-semibold">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {data.allCP.map(p => (
                      <tr key={p.id} className="border-b border-[#F6F1E9] last:border-0 transition-colors hover:bg-[#F6F1E9]/50">
                        <td className="py-3 pr-4 font-semibold text-[#101010]">{p.name}</td>
                        <td className="pr-4">{p.id}</td>
                        <td className="whitespace-nowrap pr-4">{associatedPP(p)}</td>
                        <td className="whitespace-nowrap pr-4">{fmtDate(p.joinedAt)}</td>
                        <td><StatusPill status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Promotion + KYC */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card id="promotion" title="Promotion Progress" className="border border-[#D9B66F]/40">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#101010] text-[#D9B66F]"><Crown size={28} /></div>
                <div>
                  <p className="text-xs text-[#6B6B6B]">Current Role</p>
                  <p className="font-serif text-xl font-extrabold text-[#101010]">Manager</p>
                </div>
                <div className="ml-auto"><StatusPill status="Active" /></div>
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#7A5A14]">
                <span className="rounded-full bg-[#D9B66F]/20 px-3 py-1">Channel Partner</span><ArrowRight size={14} />
                <span className="rounded-full bg-[#D9B66F]/20 px-3 py-1">Project Partner</span><ArrowRight size={14} />
                <span className="rounded-full bg-[#101010] px-3 py-1 text-[#D9B66F]">Manager</span>
              </div>
              <p className="mt-4 text-sm text-[#292929]/80">You have achieved the Manager level. Continue growing your team and business.</p>
            </Card>

            <Card title="KYC Status">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${KYC_CURRENT === 'KYC Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#D9B66F]/20 text-[#7A5A14]'}`}><ShieldCheck size={24} /></div>
                <div>
                  <p className="font-serif text-lg font-extrabold text-[#101010]">{KYC_CURRENT}</p>
                  <p className="text-xs text-[#6B6B6B]">{KYC_CURRENT === 'KYC Verified' ? 'Your identity verification is complete.' : 'Identity verification has not been submitted.'}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {KYC_STATES.map(s => (
                  <span key={s} className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    s === KYC_CURRENT ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-[#F6F1E9] text-[#6B6B6B]'
                  }`}>{s}</span>
                ))}
              </div>
            </Card>
          </div>

          {/* Project performance */}
          <Card id="projects" title="Project Performance">
            <div className="overflow-hidden rounded-xl bg-[#101010] sm:flex">
              <img
                src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=900"
                alt="DAS CITY — DIGHI PORT" className="h-48 w-full object-cover sm:h-auto sm:w-2/5"
              />
              <div className="flex flex-1 flex-col justify-center p-6">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#D9B66F]"><Briefcase size={13} />Featured Project</p>
                <h3 className="mt-2 font-serif text-xl font-extrabold text-white">{PROJECT}</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-white/60">Sales Value</p><p className="font-serif text-lg font-extrabold text-[#D9B66F]">{inr(rec.sales.total)}</p></div>
                  <div><p className="text-xs text-white/60">Plots Sold</p><p className="font-serif text-lg font-extrabold text-[#D9B66F]">{rec.sales.plots}</p></div>
                </div>
                <GoldButton className="mt-5 self-start" onClick={() => flash('View Project — preview only')}>View Project<ArrowRight size={15} /></GoldButton>
              </div>
            </div>
          </Card>

        </main>
      </div>
      <PromotionCelebration partner={partner} />

      {notice && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-[#101010] px-5 py-3 text-sm text-[#D9B66F] shadow-lg md:bottom-8">{notice}</div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/10 bg-[#101010] pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.filter(n => BOTTOM_NAV.includes(n.label)).map(({ label, icon: Icon, target }) => (
          <button key={label} onClick={() => go(label, target)}
            className={`flex min-h-[56px] flex-col items-center justify-center gap-1 text-[10px] font-medium ${active === label ? 'text-[#D9B66F]' : 'text-white/60'}`}>
            <Icon size={20} />{label.replace('My ', '')}
          </button>
        ))}
        <button onClick={() => setDrawer(true)} className="flex min-h-[56px] flex-col items-center justify-center gap-1 text-[10px] font-medium text-white/60">
          <Menu size={20} />More
        </button>
      </nav>
    </div>
  );
}
