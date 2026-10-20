import { useState } from 'react';
import {
  LayoutDashboard, User, Users, CalendarCheck, TrendingUp, UsersRound, Wallet,
  Award, Building2, Megaphone, GraduationCap, LifeBuoy, Search, Bell, Copy,
  Check, Share2, MessageCircle, Menu, X, ArrowRight, ShieldCheck, LogOut,
} from 'lucide-react';
import { useRecords, CustomersSection, SiteVisitsSection, BookingsSection } from '../../partner/PartnerRecords';
import { ROLE_LABEL } from '../../partner/store';
import { usePartnerSession, PromotionCelebration, initialsOf, fmtDate } from '../../partner/usePartnerSession';

// ---------- Business data: empty until real records exist ----------
const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, target: 'welcome' },
  { label: 'My Profile', icon: User, target: 'partner-id' },
  { label: 'My Customers', icon: Users, target: 'customers' },
  { label: 'Site Visits', icon: CalendarCheck, target: 'visits' },
  { label: 'My Sales', icon: TrendingUp, target: 'sales' },
  { label: 'My Team', icon: UsersRound, target: 'team' },
  { label: 'Commissions', icon: Wallet, target: 'commission' },
  { label: 'Promotion Progress', icon: Award, target: 'promotion' },
  { label: 'Projects', icon: Building2, target: 'projects' },
  { label: 'Marketing Materials', icon: Megaphone, target: null },
  { label: 'Training & Resources', icon: GraduationCap, target: null },
  { label: 'Help & Support', icon: LifeBuoy, target: null },
];
const BOTTOM_NAV = ['Dashboard', 'My Customers', 'Site Visits', 'My Sales'];

const COMMISSION = [
  { label: 'Pending Approval', value: '₹0' },
  { label: 'Approved', value: '₹0' },
  { label: 'Paid', value: '₹0' },
];

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
        <div className="mb-5 flex items-center justify-between gap-3">
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
  const tone =
    status === 'Fully Paid' || status === 'Qualified' || status === 'Confirmed'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-[#D9B66F]/20 text-[#7A5A14]';
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

function SalesChart({ data }: { data: { m: string; v: number }[] }) {
  const max = Math.max(0.5, Math.ceil(Math.max(...data.map(d => d.v)) * 1.1 * 2) / 2);
  const W = 360, H = 170, pad = 24;
  const bw = (W - pad * 2) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" role="img" aria-label="Monthly sales in lakhs (sample)">
      {[0, max / 2, max].map(t => {
        const y = H - (t / max) * (H - 10);
        return (
          <g key={t}>
            <line x1={pad} x2={W - pad} y1={y} y2={y} stroke="#F6F1E9" strokeWidth="1" />
            <text x={0} y={y + 3} fontSize="9" fill="#6B6B6B">{Number(t.toFixed(1))}L</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.v / max) * (H - 10);
        const x = pad + i * bw + bw * 0.2;
        return (
          <g key={d.m}>
            <rect x={x} y={H - h} width={bw * 0.6} height={Math.max(h, 2)} rx="5" fill="#D9B66F" opacity={i === 4 ? 1 : 0.55} />
            <text x={x + bw * 0.3} y={H + 16} fontSize="10" textAnchor="middle" fill="#292929">{d.m}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Page ----------
export default function PartnerDashboard() {
  const [active, setActive] = useState('Dashboard');
  const [drawer, setDrawer] = useState(false);
  const [copied, setCopied] = useState<'id' | 'link' | null>(null);
  const [notice, setNotice] = useState('');
  const { partner, data, signOut } = usePartnerSession('CP');
  const rec = useRecords(partner);
  if (!partner || !data || !rec) return null;
  const PARTNER = { name: partner.name, id: partner.id, role: ROLE_LABEL[partner.role] };
  const REFERRAL_LINK = data.link;
  const qualified = data.direct.length;
  const pct = Math.min(100, Math.round((qualified / 2) * 100));
  const SUMMARY = [
    { label: 'Total Sales', value: inr(rec.sales.total), icon: TrendingUp, sub: undefined as string | undefined },
    { label: 'My Customers', value: String(rec.customers.length), icon: Users, sub: undefined },
    { label: 'Site Visits', value: String(rec.visits.length), icon: CalendarCheck, sub: undefined },
    { label: 'My Team', value: String(data.direct.length), icon: UsersRound, sub: undefined },
    { label: 'Commission Overview', value: '₹0', sub: 'Pending Approval', icon: Wallet },
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

  return (
    <div className="min-h-screen bg-[#F6F1E9] font-sans text-[#292929]">
      {/* Sidebar: compact on tablet, full on desktop, hidden on mobile */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col bg-[#101010] p-3 md:flex lg:w-64 lg:p-4">
        <div className="mb-8 px-1 pt-3 text-center lg:px-3 lg:text-left">
          <p className="font-serif text-sm font-extrabold tracking-wide text-[#D9B66F] lg:text-lg">
            <span className="lg:hidden">V99</span><span className="hidden lg:inline">VISSION99 AQAAR</span>
          </p>
        </div>
        <div className="flex-1 overflow-y-auto"><NavList /></div>
      </aside>

      {/* Mobile drawer */}
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
        {/* Header */}
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
              <h1 className="font-serif text-2xl font-extrabold md:text-4xl">Welcome Back, {PARTNER.name}!</h1>
              <p className="mt-2 text-sm text-white/80 md:text-base">{PARTNER.role} | ID: {PARTNER.id}</p>
              <p className="mt-6 text-lg font-semibold text-[#D9B66F] md:text-xl">स्वप्न तुमचे, दिशा आमची</p>
            </div>
          </section>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
            {SUMMARY.map(({ label, value, sub, icon: Icon }, i) => (
              <div
                key={label}
                className={`rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(16,16,16,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(16,16,16,0.12)] md:p-5 ${i === 4 ? 'col-span-2 lg:col-span-1' : ''}`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9B66F]/20 text-[#7A5A14]"><Icon size={20} /></div>
                <p className="text-xs font-medium text-[#6B6B6B]">{label}</p>
                <p className="mt-1 font-serif text-xl font-extrabold text-[#101010] md:text-2xl">{value}</p>
                {sub && <p className="mt-1 text-xs font-semibold text-[#7A5A14]">{sub}</p>}
              </div>
            ))}
          </div>

          {/* ID + Referral */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card id="partner-id" className="border border-[#D9B66F]/40">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#7A5A14]">My Channel Partner ID</p>
              <p className="mt-2 font-serif text-xl font-extrabold text-[#101010] md:text-2xl">Your Channel Partner ID: <span className="text-[#7A5A14]">{PARTNER.id}</span></p>
              <p className="mt-3 text-sm leading-relaxed text-[#292929]/80">
                Customers can enter this ID during plot booking so their purchases are attributed to the correct Channel Partner.
              </p>
              <GoldButton className="mt-5" onClick={() => copy(PARTNER.id, 'id')}>
                {copied === 'id' ? <Check size={16} /> : <Copy size={16} />}{copied === 'id' ? 'Copied!' : 'Copy ID'}
              </GoldButton>
            </Card>

            <Card title="My Referral Link">
              <p className="break-all rounded-xl bg-[#F6F1E9] px-4 py-3 text-sm text-[#101010]">{REFERRAL_LINK}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#292929]/80">
                Use this link to refer new Channel Partners to your team. It is separate from the ID customers use when booking a plot.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <GoldButton onClick={() => copy(REFERRAL_LINK, 'link')}>
                  {copied === 'link' ? <Check size={16} /> : <Copy size={16} />}{copied === 'link' ? 'Copied!' : 'Copy Link'}
                </GoldButton>
                <GoldButton outline onClick={share}><Share2 size={16} />Share</GoldButton>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent('Join my team at VISSION99 AQAAR: ' + REFERRAL_LINK)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#D9B66F] px-4 text-sm font-semibold text-[#101010] transition-all duration-300 hover:bg-[#D9B66F]/15 active:scale-[0.97]"
                ><MessageCircle size={16} />WhatsApp</a>
              </div>
            </Card>
          </div>

          <CustomersSection partner={partner} rec={rec} showTeam={false} notify={flash} />

          <SiteVisitsSection partner={partner} rec={rec} showTeam={false} notify={flash} />

          <BookingsSection partner={partner} rec={rec} notify={flash} />

          {/* Sales + Commission */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card id="sales" title="My Sales" className="lg:col-span-2">
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#F6F1E9] p-4"><p className="text-xs text-[#292929]/70">Total Verified Sales</p><p className="font-serif text-xl font-extrabold text-[#101010]">{inr(rec.sales.total)}</p></div>
                <div className="rounded-xl bg-[#F6F1E9] p-4"><p className="text-xs text-[#292929]/70">Plots Sold</p><p className="font-serif text-xl font-extrabold text-[#101010]">{rec.sales.plots}</p></div>
              </div>
              <SalesChart data={rec.monthly.map(m => ({ m: m.m, v: m.t }))} />
              <h3 className="mb-3 mt-5 text-sm font-semibold text-[#101010]">Recent Verified Sales</h3>
              {rec.recent.length === 0 && <Empty text="No sales recorded yet." />}
              <div className="divide-y divide-[#F6F1E9]">
                {rec.recent.map(({ booking: b, fin }) => (
                  <div key={b.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div><p className="font-semibold text-[#101010]">{b.customerName}</p><p className="text-xs text-[#6B6B6B]">Plot {b.plotNumber} · {b.project}</p></div>
                    <p className="font-semibold">{inr(fin.verified)}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card id="commission" title="Commission Overview" className="bg-[#101010] text-white">
              <p className="text-xs text-white/60">Total Estimated Commission</p>
              <p className="mt-1 font-serif text-3xl font-extrabold text-[#D9B66F]">₹0</p>
              <div className="mt-6 space-y-3">
                {COMMISSION.map(c => (
                  <div key={c.label} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
                    <span className="text-white/70">{c.label}</span><span className="font-semibold">{c.value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-white/65">No commission history available.</p>
            </Card>
          </div>

          {/* Team + Promotion */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card id="team" title="My Team" action={<GoldButton outline onClick={() => flash('View My Team — preview only')}>View My Team</GoldButton>}>
              {data.direct.length === 0 && <Empty text="No team members yet. Share your referral link to get started." />}
              <div className="space-y-3">
                {data.direct.map(t => (
                  <div key={t.id} className="flex items-center gap-4 rounded-xl bg-[#F6F1E9]/60 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#101010] font-bold text-[#D9B66F]">{initialsOf(t.name)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#101010]">{t.name}</p>
                      <p className="text-xs text-[#6B6B6B]">{t.id} · Joined {fmtDate(t.joinedAt)}</p>
                      <p className="text-xs text-[#292929]/70">{ROLE_LABEL[t.role]}</p>
                    </div>
                    <StatusPill status="Qualified" />
                  </div>
                ))}
              </div>
            </Card>

            <Card id="promotion" title="Promotion Progress">
              <div className="flex items-center justify-between text-sm">
                <div><p className="text-xs text-[#6B6B6B]">Current Role</p><p className="font-semibold text-[#101010]">Channel Partner</p></div>
                <ArrowRight size={18} className="text-[#D9B66F]" />
                <div className="text-right"><p className="text-xs text-[#6B6B6B]">Next Role</p><p className="font-semibold text-[#7A5A14]">Project Partner</p></div>
              </div>
              <div className="mb-2 mt-6 flex items-end justify-between">
                <p className="text-sm font-semibold text-[#101010]">Qualified Channel Partners: {qualified} / 2</p>
                <p className="font-serif text-xl font-extrabold text-[#7A5A14]">{pct}%</p>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[#F6F1E9]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#D9B66F] to-[#e8cd92]" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-4 text-sm text-[#292929]/80">{qualified === 0 ? 'Refer 2 qualified Channel Partners to move toward the next level.' : `${2 - qualified} more qualified Channel Partner${2 - qualified === 1 ? '' : 's'} needed for the next level.`}</p>
            </Card>
          </div>

          <Card title="KYC Status">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D9B66F]/20 text-[#7A5A14]"><ShieldCheck size={24} /></div>
              <div>
                <p className="font-serif text-lg font-extrabold text-[#101010]">{partner.kycStatus}</p>
                <p className="text-xs text-[#6B6B6B]">Identity verification has not been submitted.</p>
              </div>
            </div>
          </Card>

          {/* Projects */}
          <Card id="projects" title="Projects">
            <div className="overflow-hidden rounded-xl bg-[#101010] sm:flex">
              <img
                src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=900"
                alt="DAS CITY — DIGHI PORT" className="h-48 w-full object-cover sm:h-auto sm:w-2/5"
              />
              <div className="flex flex-1 flex-col justify-center p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#D9B66F]">Featured Project</p>
                <h3 className="mt-2 font-serif text-xl font-extrabold text-white">DAS CITY — DIGHI PORT</h3>
                <GoldButton className="mt-5 self-start" onClick={() => flash('View Project — preview only')}>View Project<ArrowRight size={15} /></GoldButton>
              </div>
            </div>
          </Card>

        </main>
      </div>
      <PromotionCelebration partner={partner} />

      {/* Toast */}
      {notice && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-[#101010] px-5 py-3 text-sm text-[#D9B66F] shadow-lg md:bottom-8">{notice}</div>
      )}

      {/* Mobile bottom nav */}
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
