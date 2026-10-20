import { FormEvent, useState } from 'react';
import { api } from '../lib/api';
import { useAdmin } from './AdminAuth';
import { ChangePassword } from './AdminShell';
import { Btn, Card, DateRange, Empty, ErrorBox, Kpi, Loading, Page, Pill, ROLE_NAME, Table, fmtDate, fmtDateTime, inputCls, inr, useApi } from './ui';

// ---------- Customers ----------
export function Customers() {
  const { data, error } = useApi<{ customers: { id: string; name: string; mobile: string; email?: string; bookings: number; verifiedPaid: number; remaining: number; confirmed: boolean; partnerId: string; partnerName: string; createdAt: string }[] }>('/api/admin/customers');
  if (error) return <ErrorBox text={error} />;
  if (!data) return <Loading />;
  return (
    <Page title="Customers (Buyers)" subtitle="A customer is confirmed after their first verified payment.">
      <Card>
        <Table rowKey={c => c.id} empty="No customers yet." rows={data.customers}
          cols={[
            { head: 'Customer', cell: c => <strong>{c.name}</strong> }, { head: 'Mobile', cell: c => c.mobile },
            { head: 'Partner', cell: c => `${c.partnerName} (${c.partnerId})` },
            { head: 'Bookings', right: true, cell: c => c.bookings },
            { head: 'Verified paid', right: true, cell: c => inr(c.verifiedPaid) },
            { head: 'Balance', right: true, cell: c => inr(c.remaining) },
            { head: 'Status', cell: c => <Pill text={c.confirmed ? 'Confirmed' : 'Awaiting verified payment'} /> },
          ]} />
      </Card>
    </Page>
  );
}

// ---------- Site visits ----------
interface V { id: string; ref: string; customer: string; mobile: string; project: string; date: string; time: string; partnerId: string; partnerName: string; partnerRole: string; visitors: number; status: string; converted: boolean }
export function Visits() {
  const { data, error, reload } = useApi<{ visits: V[] }>('/api/admin/visits');
  const [err, setErr] = useState('');
  if (error) return <ErrorBox text={error} />;
  if (!data) return <Loading />;
  async function set(v: V, status: string) {
    setErr('');
    const r = await api('PATCH', `/api/admin/visits/${v.id}`, { status });
    if (!r.ok) setErr(r.message); else reload();
  }
  return (
    <Page title="Site Visits" subtitle="Visits submitted by Channel Partners, Project Partners and Managers.">
      <Card>
        <ErrorBox text={err} />
        <Table rowKey={v => v.id} empty="No site visits have been submitted yet." rows={data.visits}
          cols={[
            { head: 'Customer', cell: v => <>{v.customer}<br /><span className="text-xs text-[#292929]/75">{v.mobile} · {v.ref}</span></> },
            { head: 'Project', cell: v => v.project },
            { head: 'Visit', cell: v => `${fmtDate(v.date)} ${v.time}` },
            { head: 'Partner', cell: v => <>{v.partnerName}<br /><span className="text-xs text-[#292929]/75">{v.partnerId} · {ROLE_NAME[v.partnerRole]}</span></> },
            { head: 'Visitors', right: true, cell: v => v.visitors },
            { head: 'Status', cell: v => v.converted ? <Pill text="Converted to Booking" /> : (
              <select className={`${inputCls} !h-9 w-auto`} value={v.status} onChange={e => set(v, e.target.value)}>
                {['Scheduled', 'Confirmed', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}</select>) },
            { head: 'Converted', cell: v => (v.converted ? 'Yes' : 'No') },
          ]} />
      </Card>
    </Page>
  );
}

// ---------- Projects & plots ----------
interface Pj { id: string; name: string; totalPlots: number; availablePlots: number; reservedPlots: number; soldPlots: number; bookings: number; salesValue: number; collections: number; plots: { id: string; number: string; area: number | null; status: string }[] }
export function Projects() {
  const { data, error, reload } = useApi<{ projects: Pj[] }>('/api/admin/projects');
  const [form, setForm] = useState({ plot: '', area: '' }); const [msg, setMsg] = useState('');
  if (error) return <ErrorBox text={error} />;
  if (!data) return <Loading />;
  async function add(e: FormEvent, id: string) {
    e.preventDefault(); setMsg('');
    const r = await api('POST', `/api/admin/projects/${id}/plots`, { plotNumber: form.plot, areaGuntha: form.area ? Number(form.area) : null });
    if (!r.ok) return setMsg(r.message);
    setForm({ plot: '', area: '' }); reload();
  }
  return (
    <Page title="Projects & Plots" subtitle="Inventory shows only plots recorded in the system. Plots are added here or when first booked.">
      {data.projects.length === 0 && <Empty text="No projects found." />}
      {data.projects.map(p => (
        <Card key={p.id} title={p.name}>
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {[['Total plots', p.totalPlots], ['Available', p.availablePlots], ['Reserved', p.reservedPlots], ['Sold', p.soldPlots], ['Bookings', p.bookings], ['Sales value', inr(p.salesValue)], ['Verified collections', inr(p.collections)]].map(([l, v]) => (
              <div key={String(l)} className="rounded-xl bg-[#F6F1E9] p-3 text-center"><p className="font-serif text-lg font-extrabold text-[#101010]">{v}</p><p className="text-xs text-[#292929]/75">{l}</p></div>
            ))}
          </div>
          <Table rowKey={x => x.id} empty="No plots recorded yet." rows={p.plots}
            cols={[{ head: 'Plot', cell: x => <strong>{x.number}</strong> }, { head: 'Area (Guntha)', right: true, cell: x => x.area ?? '—' }, { head: 'Status', cell: x => <Pill text={x.status} /> }]} />
          <form onSubmit={e => add(e, p.id)} className="mt-4 flex flex-wrap gap-2">
            <input className={`${inputCls} max-w-[180px]`} placeholder="Plot number" value={form.plot} onChange={e => setForm({ ...form, plot: e.target.value })} required />
            <input className={`${inputCls} max-w-[180px]`} placeholder="Area (Guntha)" type="number" step="any" min="0" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
            <Btn type="submit" variant="outline">Add plot</Btn>
          </form>
          <ErrorBox text={msg} />
        </Card>
      ))}
    </Page>
  );
}

// ---------- Commissions ----------
export function Commissions() {
  const { data, error } = useApi<{ engineAvailable: boolean; note: string; partners: { id: string; name: string; role: string; earned: number; pending: number; approved: number; paid: number }[]; totals: Record<string, number> }>('/api/admin/commissions');
  if (error) return <ErrorBox text={error} />;
  if (!data) return <Loading />;
  return (
    <Page title="Commissions & Payouts" subtitle="Commission records are read from the database; nothing is calculated or paid out here.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Earned" value={inr(data.totals.earned)} /><Kpi label="Pending" value={inr(data.totals.pending)} />
        <Kpi label="Approved" value={inr(data.totals.approved)} /><Kpi label="Paid" value={inr(data.totals.paid)} />
      </div>
      {!data.engineAvailable && <Empty text={data.note} />}
      <Card title="By partner">
        <Table rowKey={p => p.id} empty="No commission records exist yet." rows={data.partners.filter(p => p.earned > 0)}
          cols={[{ head: 'Partner', cell: p => `${p.name} (${p.id})` }, { head: 'Role', cell: p => ROLE_NAME[p.role] },
            { head: 'Earned', right: true, cell: p => inr(p.earned) }, { head: 'Pending', right: true, cell: p => inr(p.pending) },
            { head: 'Approved', right: true, cell: p => inr(p.approved) }, { head: 'Paid', right: true, cell: p => inr(p.paid) }]} />
      </Card>
    </Page>
  );
}

// ---------- Reports ----------
interface Rep {
  daily: { date: string; bookings: number; sales: number; collections: number }[]; monthly: { month: string; bookings: number; sales: number; collections: number }[];
  outstanding: { ref: string; customer: string; project: string; plot: string; price: number; collected: number; remaining: number }[];
  partners: { id: string; name: string; role: string; personalSales: number; teamSales: number; personalCollections: number; teamCollections: number }[];
  projects: { id: string; name: string; bookings: number; salesValue: number; collections: number; outstanding: number }[];
  visitConversion: { visits: number; converted: number; rate: number; byPartner: { partnerId: string; partnerName: string; visits: number; converted: number }[] };
}
export function Reports() {
  const [r, setR] = useState({ from: '', to: '' });
  const { data, error } = useApi<Rep>(`/api/admin/reports?from=${r.from}&to=${r.to}`);
  if (error) return <ErrorBox text={error} />;
  if (!data) return <Loading />;
  return (
    <Page title="Reports & Analytics" subtitle="Calculated from verified database records." actions={<DateRange from={r.from} to={r.to} onChange={(from, to) => setR({ from, to })} />}>
      <Card title="Daily sales & collections"><Table rowKey={d => d.date} empty="No sales or collections in this period." rows={[...data.daily].reverse()}
        cols={[{ head: 'Date', cell: d => fmtDate(d.date) }, { head: 'Bookings', right: true, cell: d => d.bookings }, { head: 'Sales', right: true, cell: d => inr(d.sales) }, { head: 'Collections', right: true, cell: d => inr(d.collections) }]} /></Card>
      <Card title="Monthly sales"><Table rowKey={d => d.month} empty="No data for this period." rows={data.monthly}
        cols={[{ head: 'Month', cell: d => d.month }, { head: 'Bookings', right: true, cell: d => d.bookings }, { head: 'Sales', right: true, cell: d => inr(d.sales) }, { head: 'Collections', right: true, cell: d => inr(d.collections) }]} /></Card>
      <Card title="Outstanding balances"><Table rowKey={d => d.ref} empty="No outstanding balances." rows={data.outstanding}
        cols={[{ head: 'Booking', cell: d => d.ref }, { head: 'Customer', cell: d => d.customer }, { head: 'Plot', cell: d => `${d.project} · ${d.plot}` }, { head: 'Price', right: true, cell: d => inr(d.price) }, { head: 'Collected', right: true, cell: d => inr(d.collected) }, { head: 'Remaining', right: true, cell: d => inr(d.remaining) }]} /></Card>
      <Card title="Project performance"><Table rowKey={d => d.id} empty="No projects." rows={data.projects}
        cols={[{ head: 'Project', cell: d => d.name }, { head: 'Bookings', right: true, cell: d => d.bookings }, { head: 'Sales', right: true, cell: d => inr(d.salesValue) }, { head: 'Collections', right: true, cell: d => inr(d.collections) }, { head: 'Outstanding', right: true, cell: d => inr(d.outstanding) }]} /></Card>
      <Card title="Partner performance"><Table rowKey={d => d.id} empty="No partners yet." rows={data.partners.filter(p => p.personalSales || p.teamSales || p.personalCollections)}
        cols={[{ head: 'Partner', cell: d => `${d.name} (${d.id})` }, { head: 'Role', cell: d => ROLE_NAME[d.role] }, { head: 'Personal sales', right: true, cell: d => inr(d.personalSales) }, { head: 'Team sales', right: true, cell: d => inr(d.teamSales) }, { head: 'Verified (personal / team)', right: true, cell: d => `${inr(d.personalCollections)} / ${inr(d.teamCollections)}` }]} /></Card>
      <Card title={`Site visit conversions — ${data.visitConversion.converted} of ${data.visitConversion.visits} (${data.visitConversion.rate}%)`}><Table rowKey={d => d.partnerId} empty="No site visits in this period." rows={data.visitConversion.byPartner}
        cols={[{ head: 'Partner', cell: d => `${d.partnerName} (${d.partnerId})` }, { head: 'Visits', right: true, cell: d => d.visits }, { head: 'Converted', right: true, cell: d => d.converted }]} /></Card>
    </Page>
  );
}

// ---------- Audit ----------
export function Audit() {
  const { data, error } = useApi<{ logs: { id: number; at: string; actor: string; action: string; entity: string; before: unknown; after: unknown; reason: string | null }[] }>('/api/admin/audit?limit=300');
  if (error) return <ErrorBox text={error} />;
  if (!data) return <Loading />;
  const show = (v: unknown) => (v ? <code className="break-all text-xs">{JSON.stringify(v)}</code> : '—');
  return (
    <Page title="Audit Logs" subtitle="Append-only record of sensitive actions.">
      <Card><Table rowKey={l => String(l.id)} empty="No audit entries yet." rows={data.logs}
        cols={[{ head: 'When', cell: l => fmtDateTime(l.at) }, { head: 'Actor', cell: l => l.actor }, { head: 'Action', cell: l => <strong>{l.action}</strong> }, { head: 'Entity', cell: l => l.entity },
          { head: 'Before', cell: l => show(l.before) }, { head: 'After', cell: l => show(l.after) }, { head: 'Reason', cell: l => l.reason ?? '—' }]} /></Card>
    </Page>
  );
}

// ---------- User management ----------
interface U { id: string; email: string; full_name: string; role: string; is_active: boolean; last_login_at: string | null }
export function Users() {
  const { me } = useAdmin();
  const { data, error, reload } = useApi<{ users: U[] }>('/api/admin/users');
  const [f, setF] = useState({ fullName: '', email: '', role: 'admin', temporaryPassword: '' }); const [msg, setMsg] = useState('');
  if (error) return <ErrorBox text={error} />;
  if (!data) return <Loading />;
  async function create(e: FormEvent) {
    e.preventDefault(); setMsg('');
    const r = await api('POST', '/api/admin/users', f);
    if (!r.ok) return setMsg(r.message);
    setF({ fullName: '', email: '', role: 'admin', temporaryPassword: '' }); reload();
  }
  async function toggle(u: U) { const r = await api('PATCH', `/api/admin/users/${u.id}`, { isActive: !u.is_active }); if (!r.ok) setMsg(r.message); else reload(); }
  return (
    <Page title="User Management" subtitle="Administrator accounts. Partner accounts are managed under Partners & Hierarchy.">
      <Card title="Administrators"><Table rowKey={u => u.id} empty="No administrators." rows={data.users}
        cols={[{ head: 'Name', cell: u => u.full_name }, { head: 'Email', cell: u => u.email }, { head: 'Role', cell: u => u.role.replace('_', ' ') },
          { head: 'Last login', cell: u => fmtDateTime(u.last_login_at) }, { head: 'Status', cell: u => <Pill text={u.is_active ? 'Active' : 'Inactive'} /> },
          { head: '', cell: u => (u.id !== me?.id ? <Btn small variant="outline" onClick={() => toggle(u)}>{u.is_active ? 'Deactivate' : 'Activate'}</Btn> : null) }]} /></Card>
      <Card title="Add administrator">
        <form onSubmit={create} className="grid gap-3 md:grid-cols-2">
          <input className={inputCls} placeholder="Full name" value={f.fullName} onChange={e => setF({ ...f, fullName: e.target.value })} required />
          <input className={inputCls} type="email" placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required />
          <select className={inputCls} value={f.role} onChange={e => setF({ ...f, role: e.target.value })}><option value="admin">Admin</option><option value="finance">Finance (payment verification)</option></select>
          <input className={inputCls} type="password" placeholder="Temporary password (changed at first login)" value={f.temporaryPassword} onChange={e => setF({ ...f, temporaryPassword: e.target.value })} required autoComplete="new-password" />
          <div className="md:col-span-2"><ErrorBox text={msg} /><div className="mt-2"><Btn type="submit">Create administrator</Btn></div></div>
        </form>
      </Card>
    </Page>
  );
}

// ---------- Settings ----------
export function SettingsPage() {
  const { me } = useAdmin();
  return (
    <Page title="Settings" subtitle="Your administrator account.">
      <Card title="Account"><p className="text-sm text-[#101010]">{me?.name} · {me?.email} · {me?.role.replace('_', ' ')}</p></Card>
      <Card title="Change password"><div className="max-w-md"><ChangePassword /></div></Card>
    </Page>
  );
}
