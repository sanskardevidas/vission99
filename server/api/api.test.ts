// Integration tests against the running dev server (http://localhost:5173) and the live database.
// They create clearly-labelled temporary records (test mobiles 9xxxxxxxxx, a temporary admin) that are
// removed by the cleanup step afterwards. Run:  node --experimental-strip-types --test server/api/api.test.ts
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { db } from './db.ts';
import { hashPassword } from './security.ts';
import { normalizeMobile } from './validate.ts';
import { bookingFinance, companyTotals, descendantsOf } from './finance.ts';

try { process.loadEnvFile('.env.local'); } catch { /* env from shell */ }
const BASE = process.env.TEST_BASE ?? 'http://localhost:5173';

class Client {
  jar: Record<string, string> = {};
  async call(method: string, path: string, body?: unknown) {
    const r = await fetch(BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json', Cookie: Object.entries(this.jar).map(([k, v]) => `${k}=${v}`).join('; ') },
      body: method === 'GET' ? undefined : JSON.stringify(body ?? {}),
    });
    for (const c of r.headers.getSetCookie()) {
      const [kv] = c.split(';'); const i = kv.indexOf('=');
      const v = kv.slice(i + 1);
      if (v) this.jar[kv.slice(0, i)] = v; else delete this.jar[kv.slice(0, i)];
    }
    const j = await r.json().catch(() => ({}));
    return { status: r.status, body: j as Record<string, any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

const run = String(Math.floor(Math.random() * 1e6)).padStart(6, '0');
const mob = (n: number) => `9${run}${String(n).padStart(3, '0')}`; // 10 digits, starts with 9
const PW = 'PartnerPass#1';
const ADMIN_EMAIL = `test-admin-${run}@example.test`;
const ADMIN_TEMP = 'TempAdmin#12345';
const ADMIN_NEW = 'NewAdmin#67890x';
const ids: Record<string, string> = {};

describe('pure logic', () => {
  it('normalizes Indian mobile numbers to one canonical form', () => {
    assert.equal(normalizeMobile('9876543210'), '9876543210');
    assert.equal(normalizeMobile('+91 98765 43210'), '9876543210');
    assert.equal(normalizeMobile('09876543210'), '9876543210');
    assert.equal(normalizeMobile('919876543210'), '9876543210');
    for (const bad of ['12345', '5876543210', '98765432101', 'abcdefghij', '', '+9198765']) assert.equal(normalizeMobile(bad), null);
  });
  it('finance: pending/rejected never count; refunds reduce; no double count', () => {
    const b = { id: 'b', status: 'Confirmed', approved_price: 1000, booking_date: '2026-01-01', partner_id: 'p', project_id: 'x' };
    const pays = [
      { booking_id: 'b', amount: 300, status: 'Verified', reviewed_at: 'x' }, { booking_id: 'b', amount: 200, status: 'Pending Verification', reviewed_at: null },
      { booking_id: 'b', amount: 100, status: 'Rejected', reviewed_at: 'x' },
    ];
    const refs = [{ booking_id: 'b', amount: 50, status: 'Approved', created_at: 'x' }];
    assert.deepEqual(bookingFinance(b, pays, refs), { verified: 300, pending: 200, refunded: 50, net: 250, remaining: 750 });
    assert.deepEqual(companyTotals([b], pays, refs), { sales: 1000, collections: 250, outstanding: 750 });
    assert.deepEqual(companyTotals([], [], []), { sales: 0, collections: 0, outstanding: 0 });
    assert.deepEqual(descendantsOf([{ id: 'a', referred_by: null }, { id: 'b', referred_by: 'a' }, { id: 'c', referred_by: 'b' }], 'a').sort(), ['b', 'c']);
  });
});

describe('live API + database', () => {
  const admin = new Client();
  const anon = new Client();
  const P: Record<string, Client> = {};

  before(async () => {
    const { error } = await db().from('admin_users').insert({ email: ADMIN_EMAIL, full_name: 'Temp Test Admin', role: 'super_admin', password_hash: await hashPassword(ADMIN_TEMP), must_change_password: true });
    assert.equal(error, null);
  });

  it('admin routes reject anonymous callers', async () => {
    for (const p of ['/api/admin/overview', '/api/admin/partners', '/api/admin/payments', '/api/admin/audit', '/api/admin/users']) {
      assert.equal((await anon.call('GET', p)).status, 401, p);
    }
  });

  it('admin login: wrong credentials rejected with a generic message; unknown user identical', async () => {
    const a = await anon.call('POST', '/api/admin/login', { email: ADMIN_EMAIL, password: 'wrong' });
    const b = await anon.call('POST', '/api/admin/login', { email: 'nobody@example.test', password: 'wrong' });
    assert.equal(a.status, 401); assert.equal(b.status, 401);
    assert.equal(a.body.message, b.body.message);
  });

  it('admin: first login forces a password change, then access works; old password stops working', async () => {
    const l = await admin.call('POST', '/api/admin/login', { email: ADMIN_EMAIL, password: ADMIN_TEMP });
    assert.equal(l.status, 200); assert.equal(l.body.mustChangePassword, true);
    assert.equal((await admin.call('GET', '/api/admin/overview')).body.error, 'password_change_required');
    assert.equal((await admin.call('POST', '/api/admin/change-password', { currentPassword: 'bad', newPassword: ADMIN_NEW })).status, 401);
    assert.equal((await admin.call('POST', '/api/admin/change-password', { currentPassword: ADMIN_TEMP, newPassword: 'weak' })).status, 400);
    assert.equal((await admin.call('POST', '/api/admin/change-password', { currentPassword: ADMIN_TEMP, newPassword: ADMIN_NEW })).status, 200);
    assert.equal((await admin.call('GET', '/api/admin/overview')).status, 200);
    assert.equal((await new Client().call('POST', '/api/admin/login', { email: ADMIN_EMAIL, password: ADMIN_TEMP })).status, 401);
    assert.equal((await new Client().call('POST', '/api/admin/login', { email: ADMIN_EMAIL, password: ADMIN_NEW })).status, 200);
  });

  it('money figures start at zero (no fake data) before any booking activity from this run', async () => {
    const o = (await admin.call('GET', '/api/admin/overview')).body;
    assert.equal(o.kpis.salesValue, 0); assert.equal(o.kpis.verifiedCollections, 0); assert.equal(o.kpis.outstandingBalance, 0);
    assert.equal(o.summary.confirmedBookings, 0);
  });

  it('partner registration: mobile + password only, no email/OTP; validation + uniqueness', async () => {
    const reg = async (n: number, ref?: string, name = `Test Partner ${n}`) => {
      P[n] = new Client();
      const r = await P[n].call('POST', '/api/auth/register', { name, mobile: n === 1 ? `+91 ${mob(n)}` : mob(n), password: PW, refId: ref });
      assert.equal(r.status, 200, JSON.stringify(r.body));
      ids[n] = r.body.partnerId;
    };
    assert.equal((await anon.call('POST', '/api/auth/register', { name: 'X', mobile: '12345', password: PW })).status, 400);
    assert.equal((await anon.call('POST', '/api/auth/register', { name: 'X', mobile: mob(900), password: 'short' })).status, 400);
    assert.equal((await anon.call('POST', '/api/auth/register', { name: 'X', mobile: mob(900), password: PW, refId: 'CP999999999' })).status, 400);
    await reg(1);                                           // A  (top)
    const dup = await anon.call('POST', '/api/auth/register', { name: 'Dup', mobile: `0${mob(1)}`, password: PW });
    assert.equal(dup.status, 409);                         // same normalized mobile, different input format
    await reg(2, ids[1]); await reg(3, ids[1]);             // B, C referred by A
    assert.match(ids[1], /^CP\d{6}$/);
    // After 2 direct referrals A is promoted CP -> PP; partner ID unchanged.
    const a = (await P[1].call('POST', '/api/auth/login', { mobile: mob(1), password: PW }));
    assert.equal(a.body.role, 'PP');
    await reg(4, ids[2]); await reg(5, ids[2]); await reg(6, ids[3]); await reg(7, ids[3]); // B1,B2 under B; C1,C2 under C
  });

  it('launch: registration signs in immediately, is free (no fee/KYC/approval), duplicate message points to Login, no KYC endpoint', async () => {
    const c = new Client();
    const r = await c.call('POST', '/api/auth/register', { name: 'Test Partner Launch', mobile: mob(40), password: PW });
    assert.equal(r.status, 200); assert.equal(r.body.role, 'CP');
    const st = await c.call('GET', '/api/partner/state');                      // session exists without a separate login
    assert.equal(st.status, 200); assert.equal(st.body.partner.status, 'Active'); assert.equal(st.body.partner.referredBy, null);
    assert.equal(st.body.partner.kycStatus, 'Not Submitted');                  // never falsely verified
    assert.equal((await db().from('partners').select('referred_by, kyc_status, status').eq('id', r.body.partnerId).single()).data!.referred_by, null);
    const dup = await anon.call('POST', '/api/auth/register', { name: 'Again', mobile: `+91${mob(40)}`, password: PW });
    assert.equal(dup.status, 409); assert.match(dup.body.message, /already registered.*log in/i);
    assert.equal((await c.call('POST', '/api/partner/kyc', { aadhaarLast4: '1234' })).status, 404);
    assert.equal((await db().from('partners').select('id', { count: 'exact', head: true }).eq('mobile', mob(40))).count, 1);
    ids[40] = r.body.partnerId;
  });

  it('referral hierarchy + automatic promotions (CP→PP at 2 direct, PP→Manager at 2 PP+ in team); IDs stable', async () => {
    const { data } = await db().from('partners').select('id, role, referred_by').in('id', Object.values(ids));
    const role = (n: number) => data!.find(p => p.id === ids[n])!.role;
    assert.equal(role(2), 'PP'); assert.equal(role(3), 'PP');       // B, C each have 2 direct referrals
    assert.equal(role(1), 'MG');                                   // A has two PP in team
    assert.equal(role(4), 'CP'); assert.equal(data!.find(p => p.id === ids[4])!.referred_by, ids[2]);
    const hist = await db().from('partner_role_history').select('from_role, to_role, reason').eq('partner_id', ids[1]).order('id');
    assert.deepEqual(hist.data!.map(h => `${h.from_role}>${h.to_role}:${h.reason}`), ['null>CP:registration', 'CP>PP:auto_promotion', 'PP>MG:auto_promotion']);
  });

  it('partner login by mobile; role-based redirect info; wrong password generic; no email involved', async () => {
    for (const n of [1, 2, 4]) {
      const r = await P[n].call('POST', '/api/auth/login', { mobile: n === 1 ? `+91${mob(1)}` : mob(n), password: PW });
      assert.equal(r.status, 200); assert.equal(r.body.role, { 1: 'MG', 2: 'PP', 4: 'CP' }[n]);
    }
    const bad = await anon.call('POST', '/api/auth/login', { mobile: mob(2), password: 'nope' });
    const none = await anon.call('POST', '/api/auth/login', { mobile: mob(950), password: 'nope' });
    assert.equal(bad.status, 401); assert.equal(bad.body.message, none.body.message);
    assert.equal((await anon.call('POST', '/api/auth/login', { email: 'a@b.co', password: PW })).status, 401);
  });

  it('brute force: 5 failures lock the account even for the correct password', async () => {
    const c = new Client();
    for (let i = 0; i < 5; i++) assert.equal((await c.call('POST', '/api/auth/login', { mobile: mob(3), password: `bad${i}` })).status, 401);
    const locked = await c.call('POST', '/api/auth/login', { mobile: mob(3), password: PW });
    assert.equal(locked.status, 429);
    await db().from('login_attempts').delete().eq('identifier', mob(3)); // unlock for the following tests
  });

  it('authorization: partner cookie cannot reach admin API; admin cookie cannot reach partner API', async () => {
    for (const p of ['/api/admin/overview', '/api/admin/payments', '/api/admin/partners']) assert.equal((await P[1].call('GET', p)).status, 401, p);
    assert.equal((await P[1].call('POST', `/api/admin/payments/${crypto.randomUUID()}/review`, { decision: 'Verified' })).status, 401);
    assert.equal((await admin.call('GET', '/api/partner/state')).status, 401);
    assert.equal((await anon.call('GET', '/api/partner/state')).status, 401);
  });

  const today = new Date().toISOString().slice(0, 10);
  const PROJ = 'DAS CITY — DIGHI PORT';
  const booking = (extra: object) => ({ customerName: 'Cust', mobile: '9811111111', project: PROJ, plotNumber: 'T1', areaGuntha: 10, ratePerGuntha: 100000, finalPrice: 1000000, bookingDate: today, ...extra });
  const adv = (amount: number, txn: string, method = 'UPI') => ({ type: 'Booking Advance', amount, date: today, method, txnRef: txn });
  let bk1 = '', bk2 = '', bk3 = '';
  const stateOf = async (n: number) => (await P[n].call('GET', '/api/partner/state')).body;

  it('all test partners can log in with mobile + password', async () => {
    for (const n of [3, 5, 6, 7]) assert.equal((await P[n].call('POST', '/api/auth/login', { mobile: mob(n), password: PW })).status, 200);
  });

  it('site visit → booking conversion; bookings & payments stored in DB; payment starts Pending Verification', async () => {
    const v = await P[4].call('POST', '/api/partner/visits', { customerName: 'Visit Cust One', mobile: '9822222222', project: PROJ, date: today, time: '11:00', visitors: 3 });
    assert.equal(v.status, 200, JSON.stringify(v.body));
    const visitId = (await stateOf(4)).visits[0].id;
    const b = await P[4].call('POST', '/api/partner/bookings', booking({ visitId, plotNumber: 'T1', advance: adv(200000, `TX-${run}-A`) }));
    assert.equal(b.status, 200, JSON.stringify(b.body));
    const s = await stateOf(4);
    assert.equal(s.bookings.length, 1); assert.equal(s.bookings[0].customerName, 'Visit Cust One'); // carried from visit
    assert.equal(s.visits[0].status, 'Converted to Booking');
    assert.equal(s.payments[0].status, 'Pending Verification');
    bk1 = s.bookings[0].id;
    // Not yet counted anywhere
    const o = (await admin.call('GET', '/api/admin/overview')).body;
    assert.equal(o.kpis.verifiedCollections, 0); assert.equal(o.summary.pendingPaymentVerifications, 1); assert.equal(o.summary.confirmedCustomers, 0);
  });

  it('booking rules: below-calculated price needs approval; duplicate plot/txn, over-balance, cash limit, ownership rejected', async () => {
    const b2 = await P[5].call('POST', '/api/partner/bookings', booking({ customerName: 'Cust Two', mobile: '9833333333', plotNumber: 'T2', areaGuntha: 5, ratePerGuntha: 200000, finalPrice: 900000, advance: adv(100000, `TX-${run}-B`) }));
    assert.equal(b2.status, 200, JSON.stringify(b2.body));
    const b3 = await P[6].call('POST', '/api/partner/bookings', booking({ customerName: 'Cust Three', mobile: '9844444444', plotNumber: 'T3', areaGuntha: 2, ratePerGuntha: 100000, finalPrice: 200000, advance: adv(200000, `TX-${run}-C`) }));
    assert.equal(b3.status, 200, JSON.stringify(b3.body));
    bk2 = (await stateOf(5)).bookings[0].id; bk3 = (await stateOf(6)).bookings[0].id;
    assert.equal((await stateOf(5)).bookings[0].discountApproval, 'Pending Admin Approval');
    const taken = await P[7].call('POST', '/api/partner/bookings', booking({ customerName: 'Late', mobile: '9855555555', plotNumber: 't1' }));
    assert.equal(taken.status, 400); assert.match(taken.body.message, /active booking/);
    const dup = await P[4].call('POST', '/api/partner/payments', { bookingId: bk1, type: 'Installment', amount: 1000, date: today, method: 'UPI', txnRef: `tx-${run}-a` });
    assert.equal(dup.status, 400); assert.match(dup.body.message, /already been submitted/);
    const over = await P[4].call('POST', '/api/partner/payments', { bookingId: bk1, type: 'Installment', amount: 900000, date: today, method: 'UPI', txnRef: `TX-${run}-OVER` });
    assert.equal(over.status, 400); assert.match(over.body.message, /exceeds/);
    const cash = await P[4].call('POST', '/api/partner/payments', { bookingId: bk1, type: 'Installment', amount: 250000, date: today, method: 'Cash', txnRef: `TX-${run}-CASH` });
    assert.equal(cash.status, 400); assert.match(cash.body.message, /Cash/);
    const other = await P[4].call('POST', '/api/partner/payments', { bookingId: bk3, type: 'Installment', amount: 1, date: today, method: 'UPI', txnRef: `TX-${run}-X` });
    assert.equal(other.status, 403);
    assert.equal((await P[4].call('POST', '/api/partner/payments', { bookingId: bk1, type: 'Installment', amount: 0, date: today, method: 'UPI', txnRef: 'z' })).status, 400);
  });

  it('visibility: CP sees only own records; PP/Manager see their team', async () => {
    assert.equal((await stateOf(4)).bookings.length, 1);
    assert.equal((await stateOf(2)).bookings.length, 2);   // B (PP) sees B1 + B2
    assert.equal((await stateOf(3)).bookings.length, 1);   // C sees C1
    assert.equal((await stateOf(1)).bookings.length, 3);   // A (Manager) sees all
    assert.equal((await stateOf(7)).bookings.length, 0);
  });

  it('payment verification: partner cannot approve; admin approval updates collections and balances', async () => {
    const pays = (await admin.call('GET', '/api/admin/payments?status=Pending%20Verification')).body.payments;
    assert.equal(pays.length, 3);
    const idOf = (ref: string) => pays.find((p: any) => p.txnRef === ref).id; // eslint-disable-line @typescript-eslint/no-explicit-any
    assert.equal((await P[4].call('POST', `/api/admin/payments/${idOf(`TX-${run}-A`)}/review`, { decision: 'Verified' })).status, 401);
    assert.equal((await admin.call('POST', `/api/admin/payments/${idOf(`TX-${run}-A`)}/review`, { decision: 'Rejected' })).status, 400); // reason required
    assert.equal((await admin.call('POST', `/api/admin/payments/${idOf(`TX-${run}-A`)}/review`, { decision: 'Verified' })).status, 200);
    assert.equal((await admin.call('POST', `/api/admin/payments/${idOf(`TX-${run}-A`)}/review`, { decision: 'Verified' })).status, 409); // already reviewed
    assert.equal((await admin.call('POST', `/api/admin/payments/${idOf(`TX-${run}-C`)}/review`, { decision: 'Verified' })).status, 200);

    let o = (await admin.call('GET', '/api/admin/overview')).body;
    assert.equal(o.kpis.salesValue, 1200000);              // T1 1,000,000 + T3 200,000 (T2 awaits price approval)
    assert.equal(o.kpis.verifiedCollections, 400000);      // pending 100,000 NOT counted
    assert.equal(o.kpis.outstandingBalance, 800000);       // 1,000,000-200,000 ; T3 fully paid
    assert.equal(o.summary.pendingPaymentVerifications, 1);
    assert.equal(o.summary.confirmedCustomers, 2);         // customer appears after first verified payment
    assert.equal(o.summary.pendingBookingApprovals, 1);
    assert.equal(o.bookingStatus.Pending, 1); assert.equal(o.bookingStatus.Confirmed, 2);
    assert.equal(o.summary.soldPlots, 1);                  // T3 fully paid

    // customer view for the partner: only verified-payment customers get "My Customers" status
    const fin = (await stateOf(4)).payments.find((p: any) => p.bookingId === bk1); // eslint-disable-line @typescript-eslint/no-explicit-any
    assert.equal(fin.status, 'Verified');

    // price approval (audited), then verify the last payment
    assert.equal((await admin.call('POST', `/api/admin/bookings/${bk2}/discount`, { approve: true })).status, 400);
    assert.equal((await admin.call('POST', `/api/admin/bookings/${bk2}/discount`, { approve: true, reason: 'Approved by management' })).status, 200);
    assert.equal((await admin.call('POST', `/api/admin/payments/${idOf(`TX-${run}-B`)}/review`, { decision: 'Verified' })).status, 200);
    o = (await admin.call('GET', '/api/admin/overview')).body;
    assert.equal(o.kpis.salesValue, 2100000);
    assert.equal(o.kpis.verifiedCollections, 500000);
    assert.equal(o.kpis.outstandingBalance, 1600000);      // 800,000 + (900,000-100,000)
    assert.equal(o.summary.confirmedCustomers, 3);
  });

  it('rejected payments do not count; refunds reduce collections; amounts cannot exceed approved price', async () => {
    const add = await P[4].call('POST', '/api/partner/payments', { bookingId: bk1, type: 'Installment', amount: 50000, date: today, method: 'UPI', txnRef: `TX-${run}-D` });
    assert.equal(add.status, 200, JSON.stringify(add.body));
    const pend = (await admin.call('GET', '/api/admin/payments?status=Pending%20Verification')).body.payments;
    assert.equal((await admin.call('POST', `/api/admin/payments/${pend[0].id}/review`, { decision: 'Rejected', note: 'Not found in bank statement' })).status, 200);
    let o = (await admin.call('GET', '/api/admin/overview')).body;
    assert.equal(o.kpis.verifiedCollections, 500000);
    // rejected txn ref can be reused
    assert.equal((await P[4].call('POST', '/api/partner/payments', { bookingId: bk1, type: 'Installment', amount: 50000, date: today, method: 'UPI', txnRef: `TX-${run}-D` })).status, 200);
    const again = (await admin.call('GET', '/api/admin/payments?status=Pending%20Verification')).body.payments;
    assert.equal((await admin.call('POST', `/api/admin/payments/${again[0].id}/review`, { decision: 'Rejected', note: 'dup test' })).status, 200);

    assert.equal((await admin.call('POST', `/api/admin/bookings/${bk3}/refund`, { amount: 999999, reason: 'x' })).status, 400);
    assert.equal((await admin.call('POST', `/api/admin/bookings/${bk3}/refund`, { amount: 50000, reason: 'Customer request' })).status, 200);
    o = (await admin.call('GET', '/api/admin/overview')).body;
    assert.equal(o.kpis.verifiedCollections, 450000);
    assert.equal(o.kpis.outstandingBalance, 1650000);      // T3 remaining 50,000 after refund
  });

  it('personal vs team sales are not double counted', async () => {
    const parts = (await admin.call('GET', '/api/admin/partners')).body.partners;
    const g = (n: number) => parts.find((p: any) => p.id === ids[n]); // eslint-disable-line @typescript-eslint/no-explicit-any
    assert.equal(g(4).personalSales, 1000000); assert.equal(g(5).personalSales, 900000); assert.equal(g(6).personalSales, 200000);
    assert.equal(g(2).personalSales, 0); assert.equal(g(2).teamSales, 1900000);
    assert.equal(g(3).teamSales, 200000);
    assert.equal(g(1).personalSales, 0); assert.equal(g(1).teamSales, 2100000);
    const personalTotal = parts.reduce((s: number, p: any) => s + p.personalSales, 0); // eslint-disable-line @typescript-eslint/no-explicit-any
    const o = (await admin.call('GET', '/api/admin/overview')).body;
    assert.equal(personalTotal, o.kpis.salesValue);       // company total counts every booking exactly once
    assert.equal(g(1).personalCollections + g(1).teamCollections, 450000);
  });

  it('admin role/status changes are audited with before/after; inactive partners cannot log in', async () => {
    assert.equal((await admin.call('PATCH', `/api/admin/partners/${ids[7]}`, { status: 'Inactive' })).status, 400); // reason required
    assert.equal((await admin.call('PATCH', `/api/admin/partners/${ids[7]}`, { status: 'Inactive', reason: 'Test deactivation' })).status, 200);
    assert.equal((await new Client().call('POST', '/api/auth/login', { mobile: mob(7), password: PW })).status, 401);
    assert.equal((await admin.call('PATCH', `/api/admin/partners/${ids[7]}`, { role: 'PP', reason: 'Manual role change' })).status, 200);
    const logs = (await admin.call('GET', '/api/admin/audit?limit=100')).body.logs as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    const acts = new Set(logs.map(l => l.action));
    for (const a of ['payment.verified', 'payment.rejected', 'booking.price_approved', 'partner.status_changed', 'partner.role_changed', 'booking.refund_approved']) assert.ok(acts.has(a), a);
    const rc = logs.find(l => l.action === 'partner.role_changed');
    assert.equal(rc.before.role, 'CP'); assert.equal(rc.after.role, 'PP'); assert.equal(rc.actor, ADMIN_EMAIL);
    assert.equal((await db().from('partner_role_history').select('id').eq('partner_id', ids[7]).eq('reason', 'admin_change')).data!.length, 1);
  });

  it('admin lists: site visits, customers, projects, commissions (empty state), reports', async () => {
    assert.equal((await admin.call('GET', '/api/admin/visits')).body.visits.length, 1);
    assert.equal((await admin.call('GET', '/api/admin/customers')).body.customers.length, 3);
    const pr = (await admin.call('GET', '/api/admin/projects')).body.projects[0];
    assert.equal(pr.name, PROJ); assert.equal(pr.totalPlots, 3); assert.equal(pr.soldPlots, 1); assert.equal(pr.reservedPlots, 2);
    const cm = (await admin.call('GET', '/api/admin/commissions')).body;
    assert.equal(cm.engineAvailable, false); assert.equal(cm.totals.earned, 0);
    const rp = (await admin.call('GET', '/api/admin/reports')).body;
    assert.equal(rp.visitConversion.visits, 1); assert.equal(rp.visitConversion.converted, 1);
    assert.equal(rp.monthly.reduce((s: number, m: any) => s + m.sales, 0), 2100000); // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  it('secrets: service-role key is not in any API response; anon key cannot read tables', async () => {
    const text = JSON.stringify([(await admin.call('GET', '/api/admin/users')).body, (await P[1].call('GET', '/api/partner/state')).body]);
    assert.ok(!text.includes(process.env.SUPABASE_SERVICE_ROLE_KEY!)); assert.ok(!text.includes('password_hash'));
    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/partners?select=*`, { headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY! } });
    assert.ok(r.status === 401 || r.status === 403 || (await r.json()).length === 0);
  });

  after(async () => { /* data removal is a separate, explicit cleanup step */ });
});
