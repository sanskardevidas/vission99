import { useState } from 'react';
import { api } from '../lib/api';
import { Btn, Card, ErrorBox, Loading, Modal, Page, Pill, Table, fmtDate, inputCls, inr, useApi } from './ui';

interface B {
  id: string; ref: string; customer: string; mobile: string; project: string; plot: string; area: number; rate: number;
  calculatedPrice: number; proposedPrice: number; approvedPrice: number; discountApproval: string; bookingDate: string;
  partnerId: string; partnerName: string; status: string; verified: number; pending: number; remaining: number; cancelReason?: string;
}

function BookingModal({ b, onClose, onDone }: { b: B; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState(''); const [amount, setAmount] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function act(path: string, body: object) {
    setErr(''); setBusy(true);
    const r = await api('POST', `/api/admin/bookings/${b.id}/${path}`, body);
    setBusy(false);
    if (!r.ok) return setErr(r.message);
    onDone(); onClose();
  }
  const rows: [string, string][] = [
    ['Customer', `${b.customer} · ${b.mobile}`], ['Project / Plot', `${b.project} · ${b.plot}`], ['Land area', `${b.area} Guntha`],
    ['Rate per Guntha', inr(b.rate)], ['Calculated price', inr(b.calculatedPrice)], ['Proposed price', inr(b.proposedPrice)],
    ['Final approved price', inr(b.approvedPrice)], ['Verified payments (net)', inr(b.verified)], ['Pending verification', inr(b.pending)],
    ['Remaining balance', inr(b.remaining)], ['Booking date', fmtDate(b.bookingDate)], ['Responsible partner', `${b.partnerName} (${b.partnerId})`],
  ];
  return (
    <Modal title={`Booking ${b.ref}`} onClose={onClose}>
      <dl className="space-y-1 text-sm text-[#101010]">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-[#292929]/75">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
      <div className="mt-3 flex items-center gap-2"><Pill text={b.status} /><Pill text={`Price: ${b.discountApproval}`} /></div>
      {b.status !== 'Cancelled' && (
        <div className="mt-4 space-y-3 rounded-xl bg-white p-4">
          <input className={inputCls} placeholder="Reason (required, recorded in audit log)" value={reason} onChange={e => setReason(e.target.value)} />
          <ErrorBox text={err} />
          <div className="flex flex-wrap gap-2">
            {b.discountApproval === 'Pending Admin Approval' && <>
              <Btn disabled={busy || !reason} onClick={() => act('discount', { approve: true, reason })}>Approve proposed price</Btn>
              <Btn variant="outline" disabled={busy || !reason} onClick={() => act('discount', { approve: false, reason })}>Reject (keep calculated price)</Btn>
            </>}
            <Btn variant="danger" disabled={busy || !reason} onClick={() => act('cancel', { reason })}>Cancel booking</Btn>
          </div>
          {b.verified > 0 && <div className="flex gap-2 border-t border-[#F1EBDF] pt-3">
            <input className={inputCls} type="number" min={1} placeholder="Refund amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} />
            <Btn variant="outline" disabled={busy || !reason || !Number(amount)} onClick={() => act('refund', { amount: Number(amount), reason })}>Record refund</Btn>
          </div>}
        </div>
      )}
      {b.status === 'Cancelled' && <p className="mt-3 text-sm text-[#292929]">Cancelled: {b.cancelReason}</p>}
    </Modal>
  );
}

export default function Sales() {
  const { data, error, reload } = useApi<{ bookings: B[] }>('/api/admin/bookings');
  const [sel, setSel] = useState<B | null>(null);
  if (error) return <ErrorBox text={error} />;
  if (!data) return <Loading />;
  return (
    <Page title="Sales & Bookings" subtitle="Every plot booking across the company.">
      <Card>
        <Table rowKey={b => b.id} empty="No bookings have been made yet." rows={data.bookings}
          cols={[
            { head: 'Booking', cell: b => <button className="font-semibold underline" onClick={() => setSel(b)}>{b.ref}</button> },
            { head: 'Customer', cell: b => <>{b.customer}<br /><span className="text-xs text-[#292929]/75">{b.mobile}</span></> },
            { head: 'Project / Plot', cell: b => <>{b.project}<br /><span className="text-xs text-[#292929]/75">Plot {b.plot} · {b.area} Guntha @ {inr(b.rate)}</span></> },
            { head: 'Proposed', right: true, cell: b => inr(b.proposedPrice) },
            { head: 'Final approved', right: true, cell: b => inr(b.approvedPrice) },
            { head: 'Date', cell: b => fmtDate(b.bookingDate) },
            { head: 'Partner', cell: b => b.partnerId },
            { head: 'Verified', right: true, cell: b => inr(b.verified) },
            { head: 'Balance', right: true, cell: b => inr(b.remaining) },
            { head: 'Status', cell: b => <><Pill text={b.status} />{b.discountApproval === 'Pending Admin Approval' && <><br /><span className="text-xs text-[#6B4E10]">Price approval pending</span></>}</> },
          ]} />
      </Card>
      {sel && <BookingModal b={sel} onClose={() => setSel(null)} onDone={reload} />}
    </Page>
  );
}
