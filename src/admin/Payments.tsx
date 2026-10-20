import { useState } from 'react';
import { api } from '../lib/api';
import { Btn, Card, ErrorBox, Loading, Modal, Page, Pill, Table, fmtDate, fmtDateTime, inputCls, inr, useApi } from './ui';

interface P {
  id: string; ref: string; customer: string; customerMobile: string; bookingRef: string; project: string; plot: string;
  partnerId: string; partnerName: string; type: string; amount: number; date: string; method: string; txnRef: string; receipt?: string;
  status: string; submittedAt: string; reviewedAt?: string; reviewNote?: string; bookingPrice: number; bookingVerified: number;
}

function Review({ p, onClose, onDone }: { p: P; onClose: () => void; onDone: () => void }) {
  const [note, setNote] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function decide(decision: 'Verified' | 'Rejected') {
    setErr(''); setBusy(true);
    const r = await api('POST', `/api/admin/payments/${p.id}/review`, { decision, note });
    setBusy(false);
    if (!r.ok) return setErr(r.message);
    onDone(); onClose();
  }
  const rows: [string, string][] = [
    ['Customer', `${p.customer} · ${p.customerMobile}`], ['Booking', `${p.bookingRef} · ${p.project} · Plot ${p.plot}`],
    ['Submitted by', `${p.partnerName} (${p.partnerId})`], ['Type', p.type], ['Amount', inr(p.amount)], ['Payment date', fmtDate(p.date)],
    ['Mode', p.method], ['Transaction reference', p.txnRef], ['Receipt', p.receipt || 'Not attached'],
    ['Verified so far on booking', `${inr(p.bookingVerified)} of ${inr(p.bookingPrice)}`],
  ];
  return (
    <Modal title={`Payment ${p.ref}`} onClose={onClose}>
      <dl className="space-y-1 text-sm text-[#101010]">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-[#292929]/75">{k}</dt><dd className="text-right font-medium break-all">{v}</dd></div>)}</dl>
      {p.status === 'Pending Verification' ? (
        <div className="mt-4 space-y-3 rounded-xl bg-white p-4">
          <p className="text-xs text-[#292929]">Verify only after matching this transaction against the company’s actual bank/financial records.</p>
          <input className={inputCls} placeholder="Note (required when rejecting)" value={note} onChange={e => setNote(e.target.value)} />
          <ErrorBox text={err} />
          <div className="flex gap-2"><Btn disabled={busy} onClick={() => decide('Verified')}>Approve & verify</Btn><Btn variant="danger" disabled={busy || !note} onClick={() => decide('Rejected')}>Reject</Btn></div>
        </div>
      ) : <p className="mt-3 text-sm text-[#101010]"><Pill text={p.status} /> on {fmtDateTime(p.reviewedAt)}{p.reviewNote ? ` — ${p.reviewNote}` : ''}</p>}
    </Modal>
  );
}

export default function Payments() {
  const [filter, setFilter] = useState('Pending Verification');
  const { data, error, reload } = useApi<{ payments: P[] }>(`/api/admin/payments?status=${encodeURIComponent(filter)}`);
  const [sel, setSel] = useState<P | null>(null);
  if (error) return <ErrorBox text={error} />;
  return (
    <Page title="Payment Verification" subtitle="Only verified payments count toward collections and customer balances."
      actions={<select className={`${inputCls} w-auto`} value={filter} onChange={e => setFilter(e.target.value)}><option value="Pending Verification">Pending verification</option><option value="Verified">Verified</option><option value="Rejected">Rejected</option><option value="">All</option></select>}>
      <Card>
        {!data ? <Loading /> : (
          <Table rowKey={p => p.id} empty={filter === 'Pending Verification' ? 'No payments are waiting for verification.' : 'No payments found.'} rows={data.payments}
            cols={[
              { head: 'Payment', cell: p => <button className="font-semibold underline" onClick={() => setSel(p)}>{p.ref}</button> },
              { head: 'Customer', cell: p => <>{p.customer}<br /><span className="text-xs text-[#292929]/75">{p.bookingRef}</span></> },
              { head: 'Partner', cell: p => <>{p.partnerName}<br /><span className="text-xs text-[#292929]/75">{p.partnerId}</span></> },
              { head: 'Amount', right: true, cell: p => inr(p.amount) },
              { head: 'Date', cell: p => fmtDate(p.date) },
              { head: 'Mode / Ref', cell: p => <>{p.method}<br /><span className="text-xs text-[#292929]/75">{p.txnRef}</span></> },
              { head: 'Status', cell: p => <Pill text={p.status} /> },
            ]} />
        )}
      </Card>
      {sel && <Review p={sel} onClose={() => setSel(null)} onDone={reload} />}
    </Page>
  );
}
