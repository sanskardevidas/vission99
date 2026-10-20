// Partner records layer: reads come from the server-scoped cache in ./store; every write goes to the
// backend API, which derives the acting partner from the session cookie (never from caller input) and
// enforces ownership, price and balance rules in the database.
import { api } from '../lib/api';
import {
  Booking, Payment, PaymentType, PartnerRecord, VisitStatus,
  PROJECTS, descendants, readStore, refresh,
} from './store';

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

export { PROJECTS };
export const PAYMENT_METHODS = ['UPI', 'Bank Transfer', 'RTGS', 'NEFT', 'IMPS', 'Cheque', 'Cash'];
export const CASH_LIMIT = 200000; // Cash above ₹2,00,000 is not accepted (legal restriction)

// CP sees only its own records; PP / Manager also see their referral team's.
export function visibleScope(p: PartnerRecord): string[] {
  const all = readStore().partners;
  return p.role === 'CP' ? [p.id] : [p.id, ...descendants(all, p.id).map(d => d.id)];
}

// ---------- Finance math (verified payments only) ----------
export function financeOf(b: Booking, payments: Payment[]) {
  const mine = payments.filter(p => p.bookingId === b.id);
  const verified = mine.filter(p => p.status === 'Verified').reduce((s, p) => s + p.amount, 0);
  const pending = mine.filter(p => p.status === 'Pending Verification').reduce((s, p) => s + p.amount, 0);
  // Until Admin approves a discount, the approved price stays at the calculated price.
  const approvedPrice = b.discountApproval === 'Pending Admin Approval' || b.discountApproval === 'Rejected' ? b.calculatedPrice : b.finalPrice;
  const remaining = Math.max(0, approvedPrice - verified);
  const progress = approvedPrice > 0 ? Math.min(100, Math.round((verified / approvedPrice) * 100)) : 0;
  const firstAdvance = mine.find(p => p.type === 'Booking Advance' && p.status === 'Verified');
  const status = verified === 0 ? 'No Verified Payment' : remaining === 0 ? 'Fully Paid' : 'Partially Paid';
  return { mine, verified, pending, approvedPrice, remaining, progress, status, advance: firstAdvance?.amount ?? 0 };
}

// ---------- Queries (scoped to the session partner) ----------
export function recordsFor(p: PartnerRecord) {
  const store = readStore();
  const scope = new Set(visibleScope(p));
  const visits = store.visits.filter(v => scope.has(v.partnerId));
  const bookings = store.bookings.filter(b => scope.has(b.partnerId));
  const payments = store.payments.filter(pay => bookings.some(b => b.id === pay.bookingId));
  const customers = bookings
    .filter(b => !b.cancelled)
    .map(b => ({ booking: b, fin: financeOf(b, payments) }))
    .filter(c => c.fin.verified > 0); // verified-payment customers only
  return { visits, bookings, payments, customers };
}

// ---------- Writes (server-validated) ----------
async function write<T extends object = object>(method: 'POST' | 'PATCH', path: string, body: unknown): Promise<Result<T>> {
  const r = await api<T>(method, path, body);
  if (!r.ok) return { ok: false, error: r.message };
  await refresh();
  return r as Result<T>;
}

export interface VisitInput { customerName: string; mobile: string; email?: string; project: string; date: string; time: string; visitors: number; notes?: string }
export const createVisit = (input: VisitInput) => write('POST', '/api/partner/visits', input);
export const updateVisitStatus = (id: string, status: VisitStatus) => write('PATCH', `/api/partner/visits/${id}`, { status });

export interface BookingInput {
  visitId?: string;
  customerName: string; mobile: string; email?: string; address?: string;
  project: string; plotNumber: string; areaGuntha: number; ratePerGuntha: number; finalPrice: number;
  bookingDate: string;
}
export interface PaymentInput { type: PaymentType; amount: number; date: string; method: string; txnRef: string; receipt?: string }
export const createBooking = (input: BookingInput, advance?: PaymentInput) =>
  write('POST', '/api/partner/bookings', { ...input, advance });
export const submitPayment = (bookingId: string, input: PaymentInput) =>
  write('POST', '/api/partner/payments', { ...input, bookingId });
