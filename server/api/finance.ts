// Pure financial calculations shared by the admin endpoints (and unit-tested).
// Rules: sales value = approved price of Confirmed (non-cancelled) bookings.
// Net collected = verified payments - approved refunds. Pending/rejected payments never count.
export interface FBooking { id: string; status: string; approved_price: number; booking_date: string; partner_id: string; project_id: string }
export interface FPayment { booking_id: string; amount: number; status: string; reviewed_at: string | null }
export interface FRefund { booking_id: string; amount: number; status: string; created_at: string }

export function bookingFinance(b: FBooking, payments: FPayment[], refunds: FRefund[]) {
  const verified = payments.filter(p => p.booking_id === b.id && p.status === 'Verified').reduce((s, p) => s + Number(p.amount), 0);
  const pending = payments.filter(p => p.booking_id === b.id && p.status === 'Pending Verification').reduce((s, p) => s + Number(p.amount), 0);
  const refunded = refunds.filter(r => r.booking_id === b.id && r.status === 'Approved').reduce((s, r) => s + Number(r.amount), 0);
  const net = verified - refunded;
  const price = Number(b.approved_price);
  return { verified, pending, refunded, net, remaining: b.status === 'Cancelled' ? 0 : Math.max(0, price - net) };
}

export function companyTotals(bookings: FBooking[], payments: FPayment[], refunds: FRefund[]) {
  let sales = 0, outstanding = 0;
  for (const b of bookings) {
    if (b.status !== 'Confirmed') continue;
    sales += Number(b.approved_price);
    outstanding += bookingFinance(b, payments, refunds).remaining;
  }
  const collections = payments.filter(p => p.status === 'Verified').reduce((s, p) => s + Number(p.amount), 0)
    - refunds.filter(r => r.status === 'Approved').reduce((s, r) => s + Number(r.amount), 0);
  return { sales, collections, outstanding };
}

// Each booking has exactly one responsible partner, so the company total counts it once.
// Per-partner "team" figures are the downline view (excluding the partner itself) and overlap by design.
export function descendantsOf(partners: { id: string; referred_by: string | null }[], id: string): string[] {
  const kids = new Map<string, string[]>();
  for (const p of partners) if (p.referred_by) kids.set(p.referred_by, [...(kids.get(p.referred_by) ?? []), p.id]);
  const out: string[] = [], seen = new Set<string>([id]), q = [id];
  while (q.length) for (const c of kids.get(q.shift()!) ?? []) if (!seen.has(c)) { seen.add(c); out.push(c); q.push(c); }
  return out;
}
