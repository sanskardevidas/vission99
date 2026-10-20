import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAdmin } from './AdminAuth';
import { Btn, Card, ErrorBox, Loading, Modal, Page, Pill, ROLE_NAME, Table, fmtDate, fmtIst, inputCls, inr, useApi } from './ui';

interface P {
  id: string; name: string; mobile: string; role: string; status: string; referredBy: string | null; referrerName: string | null; joinedAt: string;
  personalSales: number; teamSales: number; personalCollections: number; teamCollections: number; teamSize: number;
  commission: { earned: number; pending: number; approved: number; paid: number };
}
interface Detail {
  partner: P; upline: { id: string; name: string; role: string }[]; direct: { id: string; name: string; role: string; mobile: string }[];
  bookings: { ref: string; customer: string; project: string; plot: string; approvedPrice: number; status: string; collected: number; remaining: number }[];
  roleHistory: { from: string | null; to: string; reason: string; at: string }[];
}

function PartnerDetail({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const { me } = useAdmin();
  const { data, error, reload } = useApi<Detail>(`/api/admin/partners/${id}`);
  const [role, setRole] = useState(''); const [status, setStatus] = useState(''); const [reason, setReason] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function save() {
    setErr(''); setBusy(true);
    const body: Record<string, string> = { reason };
    if (role) body.role = role;
    if (status) body.status = status;
    const r = await api('PATCH', `/api/admin/partners/${id}`, body);
    setBusy(false);
    if (!r.ok) return setErr(r.message);
    setRole(''); setStatus(''); setReason(''); reload(); onChanged();
  }
  return (
    <Modal title="Partner details" onClose={onClose}>
      {error && <ErrorBox text={error} />}
      {!data ? <Loading /> : (
        <div className="space-y-4 text-sm text-[#101010]">
          <div className="rounded-xl bg-white p-4">
            <p className="font-serif text-lg font-bold">{data.partner.name}</p>
            <p>{data.partner.id} · {data.partner.mobile} · {ROLE_NAME[data.partner.role]} · <Pill text={data.partner.status} /></p>
            <p className="mt-1 text-[#292929]/80">Joined {fmtDate(data.partner.joinedAt)} · Referral ID {data.partner.id}</p>
            <p className="text-[#292929]/80">Reports to: {data.upline.length ? data.upline.map(u => `${u.name} (${u.id})`).join(' → ') : 'Company (direct)'}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            {[['Personal sales', inr(data.partner.personalSales)], ['Team sales', inr(data.partner.teamSales)], ['Verified (personal)', inr(data.partner.personalCollections)], ['Verified (team)', inr(data.partner.teamCollections)]].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-white p-3"><p className="font-bold">{v}</p><p className="text-xs text-[#292929]/75">{l}</p></div>
            ))}
          </div>
          <div><p className="mb-1 font-semibold">Direct referrals ({data.direct.length})</p>
            {data.direct.length ? <ul className="space-y-1">{data.direct.map(d => <li key={d.id}>{d.name} · {d.id} · {ROLE_NAME[d.role]}</li>)}</ul> : <p className="text-[#292929]/75">None yet.</p>}</div>
          <div><p className="mb-1 font-semibold">Bookings ({data.bookings.length})</p>
            {data.bookings.length ? <ul className="space-y-1">{data.bookings.map(b => <li key={b.ref}>{b.ref} · {b.customer} · Plot {b.plot} · {inr(b.approvedPrice)} · paid {inr(b.collected)} · <Pill text={b.status} /></li>)}</ul> : <p className="text-[#292929]/75">None yet.</p>}</div>
          <div><p className="mb-1 font-semibold">Role history</p>
            <ul className="space-y-1">{data.roleHistory.map((h, i) => <li key={i}>{fmtDate(h.at)} · {h.from ? `${h.from} → ` : ''}{h.to} ({h.reason.replace('_', ' ')})</li>)}</ul></div>
          <div className="space-y-3 rounded-xl border border-[#D9B66F]/50 bg-white p-4">
            <p className="font-semibold">Administrative change</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-medium">Account status
                <select className={`${inputCls} mt-1`} value={status} onChange={e => setStatus(e.target.value)}><option value="">No change</option><option>Active</option><option>Inactive</option></select></label>
              <label className="text-xs font-medium">Role {me?.role !== 'super_admin' && '(Super Admin only)'}
                <select disabled={me?.role !== 'super_admin'} className={`${inputCls} mt-1`} value={role} onChange={e => setRole(e.target.value)}><option value="">No change</option><option value="CP">Channel Partner</option><option value="PP">Project Partner</option><option value="MG">Manager</option></select></label>
            </div>
            <input className={inputCls} placeholder="Reason (required, recorded in audit log)" value={reason} onChange={e => setReason(e.target.value)} />
            <ErrorBox text={err} />
            <Btn onClick={save} disabled={busy || !reason || (!role && !status)}>Save change</Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function Partners() {
  const [sp, setSp] = useSearchParams();
  const { data, error, reload } = useApi<{ partners: P[]; counts: Record<string, number> }>('/api/admin/partners');
  const [q, setQ] = useState(''); const [role, setRole] = useState('');
  useEffect(() => { const t = setInterval(reload, 30000); return () => clearInterval(t); }, [reload]); // new sign-ups appear without a manual refresh
  if (error) return <ErrorBox text={error} />;
  if (!data) return <Loading />;
  const rows = data.partners.filter(p => (!role || p.role === role) && (!q || `${p.name} ${p.id} ${p.mobile}`.toLowerCase().includes(q.toLowerCase())));
  const open = sp.get('open');
  return (
    <Page title="Partners & Hierarchy" subtitle={`${data.partners.length} registered partners · ${data.counts.CP} Channel Partners · ${data.counts.PP} Project Partners · ${data.counts.MG} Managers`}
      actions={<Btn variant="outline" onClick={reload}><RefreshCw size={16} />Refresh</Btn>}>
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <input className={`${inputCls} max-w-xs`} placeholder="Search name, ID or mobile" value={q} onChange={e => setQ(e.target.value)} />
          <select className={`${inputCls} max-w-[200px]`} value={role} onChange={e => setRole(e.target.value)}>
            <option value="">All roles</option><option value="CP">Channel Partners</option><option value="PP">Project Partners</option><option value="MG">Managers</option></select>
        </div>
        <Table rowKey={p => p.id} empty="No partners have registered yet." rows={rows}
          cols={[
            { head: 'Name', cell: p => <button className="text-left font-semibold underline" onClick={() => setSp({ open: p.id })}>{p.name}</button> },
            { head: 'Partner ID / Referral ID', cell: p => p.id },
            { head: 'Mobile', cell: p => p.mobile },
            { head: 'Role', cell: p => <Pill text={ROLE_NAME[p.role]} /> },
            { head: 'Registered (IST)', cell: p => fmtIst(p.joinedAt) },
            { head: 'Referred by', cell: p => (p.referredBy ? `${p.referrerName} (${p.referredBy})` : 'Company (direct)') },
            { head: 'Status', cell: p => <Pill text={p.status} /> },
            { head: 'Personal business', right: true, cell: p => inr(p.personalSales) },
            { head: 'Team business', right: true, cell: p => inr(p.teamSales) },
            { head: 'Verified collections', right: true, cell: p => inr(p.personalCollections + p.teamCollections) },
          ]} />
      </Card>
      {open && <PartnerDetail id={open} onClose={() => setSp({})} onChanged={reload} />}
    </Page>
  );
}
