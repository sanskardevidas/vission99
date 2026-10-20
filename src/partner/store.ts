// Partner portal data layer. The database (via the backend API) is the single source of truth;
// this module only caches the signed-in partner's server-scoped view so the existing dashboards can
// keep reading synchronously. Nothing business-related is persisted in the browser.
import { api } from '../lib/api';

export type Role = 'CP' | 'PP' | 'MG';
export const ROLE_LABEL: Record<Role, string> = {
  CP: 'Channel Partner',
  PP: 'Project Partner',
  MG: 'Manager',
};
export const ROLE_ROUTE: Record<Role, string> = {
  CP: '/partner/dashboard',
  PP: '/partner/project-partner/dashboard',
  MG: '/partner/manager/dashboard',
};

export interface Celebration { id: string; from: Role; to: Role; at: string; shown: boolean }

export interface PartnerRecord {
  id: string; // permanent Partner ID / referral identifier — never changes on promotion
  name: string;
  mobile: string;
  role: Role;
  referredBy: string | null; // company-direct when null
  joinedAt: string;
  status: 'Active' | 'Inactive';
  kycStatus: string;
  kycDetails?: { aadhaarLast4: string; panMasked: string; holder: string; bank: string; ifsc: string; accountLast4: string; verifiedAt: string; devSimulated: boolean };
  celebrations: Celebration[];
}

export type VisitStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Converted to Booking';
export interface SiteVisit {
  id: string; ref: string;
  customerName: string; mobile: string; email?: string;
  project: string; date: string; time: string; visitors: number; notes?: string;
  status: VisitStatus;
  partnerId: string; partnerName: string; partnerRole: Role;
  createdAt: string; bookingId?: string;
}
export type DiscountApproval = 'Not Required' | 'Pending Admin Approval' | 'Approved' | 'Rejected';
export interface Booking {
  id: string; ref: string; visitId?: string; visitRef?: string;
  customerName: string; mobile: string; email?: string; address?: string;
  project: string; plotNumber: string; areaGuntha: number; ratePerGuntha: number;
  calculatedPrice: number; finalPrice: number; discountApproval: DiscountApproval;
  bookingDate: string; cancelled?: boolean;
  partnerId: string; partnerName: string; partnerRole: Role;
  createdAt: string;
}
export type PaymentType = 'Booking Advance' | 'Installment' | 'Final Payment';
export type PaymentStatus = 'Pending Verification' | 'Verified' | 'Rejected';
export interface Payment {
  id: string; ref?: string; bookingId: string; type: PaymentType; amount: number; date: string;
  method: string; txnRef: string; receipt?: string;
  status: PaymentStatus; submittedBy: string; submittedAt: string; verifiedAt?: string;
}

interface ServerState {
  partner: PartnerRecord; partners: PartnerRecord[]; projects: string[];
  visits: SiteVisit[]; bookings: Booking[]; payments: Payment[];
}
export interface Store {
  partners: PartnerRecord[]; visits: SiteVisit[]; bookings: Booking[]; payments: Payment[];
}

// Project names offered in the forms (mutated in place when state loads, so imports stay live).
export const PROJECTS: string[] = [];

let me: PartnerRecord | null = null;
let store: Store = { partners: [], visits: [], bookings: [], payments: [] };
let loaded = false;
let version = 0;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = () => { version++; listeners.forEach(l => l()); };

export function subscribe(cb: () => void) { listeners.add(cb); return () => { listeners.delete(cb); }; }
export function snapshot(): string { return `${version}:${loaded ? 1 : 0}`; }
export const isLoaded = () => loaded;
export function readStore(): Store { return store; }

export function refresh(): Promise<void> {
  inflight ??= (async () => {
    const r = await api<ServerState>('GET', '/api/partner/state');
    if (r.ok) {
      me = r.partner;
      store = { partners: r.partners, visits: r.visits, bookings: r.bookings, payments: r.payments };
      PROJECTS.splice(0, PROJECTS.length, ...r.projects);
    } else if (r.status === 401) {
      me = null;
      store = { partners: [], visits: [], bookings: [], payments: [] };
    }
    loaded = true;
    emit();
  })().finally(() => { inflight = null; });
  return inflight;
}

// ---------- Queries ----------
export function getSessionPartner(): PartnerRecord | null { return me; }
export function getPartner(id: string): PartnerRecord | undefined {
  return store.partners.find(p => p.id.toLowerCase() === id.toLowerCase());
}
export function directReferrals(all: PartnerRecord[], id: string) {
  return all.filter(p => p.referredBy === id);
}
export function descendants(all: PartnerRecord[], id: string): PartnerRecord[] {
  const out: PartnerRecord[] = [];
  const queue = [id];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const c of all.filter(p => p.referredBy === cur)) { out.push(c); queue.push(c.id); }
  }
  return out;
}
export function allPartners(): PartnerRecord[] { return store.partners; }
export function referralLink(id: string) {
  return `${window.location.origin}/partner/register?ref=${id}`;
}

// ---------- Auth (mobile number + password; no email, no OTP) ----------
export function normalizeMobile(input: string): string | null {
  let d = input.replace(/[\s-]/g, '');
  if (d.startsWith('+91')) d = d.slice(3);
  else if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

export async function signIn(mobile: string, password: string):
  Promise<{ ok: true; partner: PartnerRecord } | { ok: false; error: string }> {
  const r = await api('POST', '/api/auth/login', { mobile, password });
  if (!r.ok) return { ok: false, error: r.message };
  await refresh();
  return me ? { ok: true, partner: me } : { ok: false, error: 'Unable to load your account. Please try again.' };
}
export async function signOut() {
  await api('POST', '/api/auth/logout', {});
  me = null;
  store = { partners: [], visits: [], bookings: [], payments: [] };
  emit();
}

export async function registerPartner(input: { name: string; mobile: string; password: string; refId: string | null }):
  Promise<{ ok: true; partner: PartnerRecord } | { ok: false; error: string; duplicate?: boolean }> {
  const r = await api<{ partnerId: string }>('POST', '/api/auth/register', input);
  if (!r.ok) return { ok: false, error: r.message, duplicate: r.status === 409 };
  await refresh(); // registration signs the new partner in
  return me ? { ok: true, partner: me } : { ok: false, error: 'Account created. Please log in.' };
}

export async function lookupReferrer(id: string): Promise<{ id: string; name: string } | null> {
  const r = await api<{ id: string; name: string }>('GET', `/api/referrer/${encodeURIComponent(id)}`);
  return r.ok ? { id: r.id, name: r.name } : null;
}

// ---------- Promotion celebration ----------
export function markCelebrationShown(_partnerId: string, celebrationId: string) {
  const c = me?.celebrations.find(x => x.id === celebrationId);
  if (c && !c.shown) { c.shown = true; void api('POST', `/api/partner/celebrations/${celebrationId}/shown`, {}); }
}
