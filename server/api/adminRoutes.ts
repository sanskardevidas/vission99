import { db, fetchAll } from './db.ts';
import { audit } from './audit.ts';
import { bookingFinance, companyTotals, descendantsOf, type FBooking, type FPayment, type FRefund } from './finance.ts';
import { rpcMessage } from './partnerRoutes.ts';
import { fail, ok, route, type Admin } from './router.ts';
import { destroyAllSessions, hashPassword } from './security.ts';
import { EMAIL_RE, num, str, strongAdminPassword } from './validate.ts';

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const FULL: Admin['role'][] = ['super_admin', 'admin'];
const SUPER: Admin['role'][] = ['super_admin'];
const ANY: Admin['role'][] = ['super_admin', 'admin', 'finance'];
const n = (v: unknown) => Number(v ?? 0);
const label = (a: Admin) => a.email;

// ---------- Shared data loading ----------
async function core() {
  const [bookings, payments, refunds, partners, customers, visits, plots, commissions, projects] = await Promise.all([
    fetchAll<Row>('bookings', '*, customers(full_name, mobile), inventory_projects(name), plots(plot_number)', q => q.order('created_at')),
    fetchAll<Row>('payments', '*', q => q.order('submitted_at')),
    fetchAll<Row>('refunds', '*'),
    fetchAll<Row>('partners', 'id, full_name, mobile, role, referred_by, status, joined_at, kyc_status'),
    fetchAll<Row>('customers', 'id, full_name, mobile, email, source_partner_id, created_at'),
    fetchAll<Row>('site_visits', '*, inventory_projects(name)', q => q.order('created_at')),
    fetchAll<Row>('plots', 'id, project_id, status'),
    fetchAll<Row>('commissions', '*'),
    fetchAll<Row>('inventory_projects', 'id, name, location, status'),
  ]);
  return { bookings, payments, refunds, partners, customers, visits, plots, commissions, projects };
}
type Core = Awaited<ReturnType<typeof core>>;

const inRange = (d: string | null | undefined, from: string, to: string) => !!d && (!from || d.slice(0, 10) >= from) && (!to || d.slice(0, 10) <= to);
const dateParam = (v: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '');

function partnerPerformance(d: Core, from: string, to: string) {
  const byPartner = new Map<string, { sales: number; bookings: number; net: number; verified: number }>();
  const get = (id: string) => byPartner.get(id) ?? (byPartner.set(id, { sales: 0, bookings: 0, net: 0, verified: 0 }), byPartner.get(id)!);
  for (const b of d.bookings) {
    if (!inRange(b.booking_date, from, to)) continue;
    const f = bookingFinance(b as FBooking, d.payments as FPayment[], d.refunds as FRefund[]);
    const row = get(b.partner_id);
    if (b.status === 'Confirmed') { row.sales += n(b.approved_price); row.bookings += 1; }
    row.net += f.net; row.verified += f.verified;
  }
  const comm = new Map<string, { earned: number; pending: number; approved: number; paid: number }>();
  for (const c of d.commissions) {
    const r = comm.get(c.partner_id) ?? { earned: 0, pending: 0, approved: 0, paid: 0 };
    r.earned += n(c.amount);
    if (c.status === 'Pending') r.pending += n(c.amount); else if (c.status === 'Approved') r.approved += n(c.amount); else r.paid += n(c.amount);
    comm.set(c.partner_id, r);
  }
  return d.partners.map(p => {
    const own = get(p.id);
    let teamSales = 0, teamNet = 0, teamBookings = 0;
    const down = descendantsOf(d.partners as { id: string; referred_by: string | null }[], p.id);
    for (const id of down) { const t = byPartner.get(id); if (t) { teamSales += t.sales; teamNet += t.net; teamBookings += t.bookings; } }
    return {
      id: p.id, name: p.full_name, mobile: p.mobile, role: p.role, status: p.status, referredBy: p.referred_by, joinedAt: p.joined_at,
      personalBookings: own.bookings, personalSales: own.sales, personalCollections: own.net,
      teamSize: down.length, teamBookings, teamSales, teamCollections: teamNet,
      commission: comm.get(p.id) ?? { earned: 0, pending: 0, approved: 0, paid: 0 },
    };
  });
}

function projectPerformance(d: Core, from: string, to: string) {
  return d.projects.map(pr => {
    const bks = d.bookings.filter(b => b.project_id === pr.id && inRange(b.booking_date, from, to));
    const conf = bks.filter(b => b.status === 'Confirmed');
    let outstanding = 0, collections = 0;
    for (const b of bks) {
      const f = bookingFinance(b as FBooking, d.payments as FPayment[], d.refunds as FRefund[]);
      collections += f.net;
      if (b.status === 'Confirmed') outstanding += f.remaining;
    }
    const pl = d.plots.filter(p => p.project_id === pr.id);
    return {
      id: pr.id, name: pr.name, location: pr.location, status: pr.status,
      totalPlots: pl.length, availablePlots: pl.filter(p => p.status === 'Available').length,
      reservedPlots: pl.filter(p => p.status === 'Reserved').length, soldPlots: pl.filter(p => p.status === 'Sold').length,
      bookings: bks.filter(b => b.status !== 'Cancelled').length, confirmedBookings: conf.length,
      salesValue: conf.reduce((s, b) => s + n(b.approved_price), 0), collections, outstanding,
    };
  });
}

// ---------- Overview ----------
route('GET', '/api/admin/overview', 'admin', async (c) => {
  const from = dateParam(c.query.get('from')), to = dateParam(c.query.get('to'));
  const d = await core();
  const bks = d.bookings.filter(b => inRange(b.booking_date, from, to));
  const pays = d.payments.filter(p => p.status !== 'Verified' || inRange(p.reviewed_at, from, to));
  const refs = d.refunds.filter(r => inRange(r.created_at, from, to));
  const totals = companyTotals(bks as FBooking[], pays as FPayment[], refs as FRefund[]);
  // Outstanding is a point-in-time balance for the bookings in range, using all their payments.
  const outstanding = companyTotals(bks as FBooking[], d.payments as FPayment[], d.refunds as FRefund[]).outstanding;

  // Monthly series (default: last 12 months)
  const now = new Date();
  const start = from ? new Date(from + 'T00:00:00') : new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const end = to ? new Date(to + 'T00:00:00') : now;
  const months: { key: string; sales: number; collections: number; outstanding: number }[] = [];
  for (let y = start.getFullYear(), m = start.getMonth(); y < end.getFullYear() || (y === end.getFullYear() && m <= end.getMonth()); m++) {
    if (m > 11) { m = 0; y++; }
    months.push({ key: `${y}-${String(m + 1).padStart(2, '0')}`, sales: 0, collections: 0, outstanding: 0 });
    if (months.length > 60) break;
  }
  const slot = (iso: string | null) => months.find(x => x.key === (iso ?? '').slice(0, 7));
  for (const b of d.bookings) if (b.status === 'Confirmed') { const s = slot(b.booking_date); if (s) s.sales += n(b.approved_price); }
  for (const p of d.payments) if (p.status === 'Verified') { const s = slot(p.reviewed_at); if (s) s.collections += n(p.amount); }
  for (const r of d.refunds) if (r.status === 'Approved') { const s = slot(r.created_at); if (s) s.collections -= n(r.amount); }
  let cs = 0, cc = 0;
  for (const m of months) { cs += m.sales; cc += m.collections; m.outstanding = Math.max(0, cs - cc); }

  const verifiedCustomers = new Set<string>();
  for (const b of d.bookings) {
    if (b.status === 'Cancelled') continue;
    if (d.payments.some(p => p.booking_id === b.id && p.status === 'Verified')) verifiedCustomers.add(b.customer_id);
  }
  const perf = partnerPerformance(d, from, to);
  return ok({
    range: { from, to },
    kpis: { salesValue: totals.sales, verifiedCollections: totals.collections, outstandingBalance: outstanding, activePartners: d.partners.filter(p => p.status === 'Active').length },
    summary: {
      confirmedBookings: bks.filter(b => b.status === 'Confirmed').length,
      pendingBookingApprovals: d.bookings.filter(b => b.discount_approval === 'Pending Admin Approval').length,
      pendingPaymentVerifications: d.payments.filter(p => p.status === 'Pending Verification').length,
      confirmedCustomers: verifiedCustomers.size,
      siteVisits: d.visits.filter(v => inRange(v.visit_date, from, to)).length,
      availablePlots: d.plots.filter(p => p.status === 'Available').length,
      soldPlots: d.plots.filter(p => p.status === 'Sold').length,
      pendingCommissionPayouts: d.commissions.filter(x => x.status !== 'Paid').reduce((s, x) => s + n(x.amount), 0),
    },
    monthly: months,
    bookingStatus: {
      Confirmed: bks.filter(b => b.status === 'Confirmed').length,
      Pending: bks.filter(b => b.status === 'Pending').length,
      Cancelled: bks.filter(b => b.status === 'Cancelled').length,
    },
    projects: projectPerformance(d, from, to),
    partnerPerformance: perf.sort((a, b) => b.personalSales + b.teamSales - (a.personalSales + a.teamSales)).slice(0, 10),
  });
}, { roles: ANY });

// ---------- Partners ----------
route('GET', '/api/admin/partners', 'admin', async () => {
  const d = await core();
  const perf = partnerPerformance(d, '', '');
  const byId = new Map(d.partners.map(p => [p.id, p]));
  return ok({
    partners: perf.map(p => ({ ...p, referrerName: p.referredBy ? byId.get(p.referredBy)?.full_name ?? null : null })),
    counts: { CP: d.partners.filter(p => p.role === 'CP').length, PP: d.partners.filter(p => p.role === 'PP').length, MG: d.partners.filter(p => p.role === 'MG').length },
  });
}, { roles: FULL });

route('GET', '/api/admin/partners/:id', 'admin', async (c) => {
  const d = await core();
  const p = d.partners.find(x => x.id === c.params.id);
  if (!p) return fail(404, 'not_found');
  const perf = partnerPerformance(d, '', '').find(x => x.id === p.id)!;
  const up: Row[] = [];
  for (let cur = p.referred_by; cur && up.length < 20; cur = d.partners.find(x => x.id === cur)?.referred_by) {
    const u = d.partners.find(x => x.id === cur); if (!u) break; up.push({ id: u.id, name: u.full_name, role: u.role });
  }
  const history = await fetchAll<Row>('partner_role_history', '*', q => q.eq('partner_id', p.id).order('id'));
  const bookings = d.bookings.filter(b => b.partner_id === p.id).map(b => ({
    ref: b.ref, customer: b.customers?.full_name, project: b.inventory_projects?.name, plot: b.plots?.plot_number,
    approvedPrice: n(b.approved_price), status: b.status,
    ...(({ net, remaining }) => ({ collected: net, remaining }))(bookingFinance(b as FBooking, d.payments as FPayment[], d.refunds as FRefund[])),
  }));
  return ok({
    partner: perf, upline: up, bookings,
    direct: d.partners.filter(x => x.referred_by === p.id).map(x => ({ id: x.id, name: x.full_name, role: x.role, mobile: x.mobile })),
    roleHistory: history.map(h => ({ from: h.from_role, to: h.to_role, reason: h.reason, at: h.created_at })),
    kycStatus: p.kyc_status,
  });
}, { roles: FULL });

route('PATCH', '/api/admin/partners/:id', 'admin', async (c) => {
  const a = c.admin!;
  const reason = str(c.body.reason, 300);
  if (!reason) return fail(400, 'invalid', { message: 'A reason is required for this change.' });
  const { data: p } = await db().from('partners').select('id, role, status').eq('id', c.params.id).maybeSingle();
  if (!p) return fail(404, 'not_found');
  const patch: Row = {};
  if (c.body.status !== undefined) {
    if (!['Active', 'Inactive'].includes(c.body.status)) return fail(400, 'invalid', { message: 'Invalid status.' });
    patch.status = c.body.status;
  }
  if (c.body.role !== undefined) {
    if (a.role !== 'super_admin') return fail(403, 'forbidden', { message: 'Only a Super Admin can change partner roles.' });
    if (!['CP', 'PP', 'MG'].includes(c.body.role)) return fail(400, 'invalid', { message: 'Invalid role.' });
    patch.role = c.body.role;
  }
  if (!Object.keys(patch).length) return fail(400, 'invalid', { message: 'Nothing to change.' });
  await db().from('partners').update(patch).eq('id', p.id);
  if (patch.role && patch.role !== p.role) {
    await db().from('partner_role_history').insert({ partner_id: p.id, from_role: p.role, to_role: patch.role, reason: 'admin_change', changed_by_admin: a.id });
  }
  if (patch.status === 'Inactive') await destroyAllSessions('partner', p.id);
  await audit({
    actorType: 'admin', actorId: a.id, actorLabel: label(a), entityType: 'partner', entityId: p.id, reason,
    action: patch.role ? 'partner.role_changed' : 'partner.status_changed',
    before: { role: p.role, status: p.status }, after: { role: patch.role ?? p.role, status: patch.status ?? p.status },
  });
  return ok();
}, { roles: FULL });

// ---------- Customers ----------
route('GET', '/api/admin/customers', 'admin', async () => {
  const d = await core();
  const rows = d.customers.map(cu => {
    const bks = d.bookings.filter(b => b.customer_id === cu.id && b.status !== 'Cancelled');
    let verified = 0, remaining = 0;
    for (const b of bks) {
      const f = bookingFinance(b as FBooking, d.payments as FPayment[], d.refunds as FRefund[]);
      verified += f.net; if (b.status === 'Confirmed') remaining += f.remaining;
    }
    const partner = d.partners.find(p => p.id === cu.source_partner_id);
    return {
      id: cu.id, name: cu.full_name, mobile: cu.mobile, email: cu.email, bookings: bks.length, verifiedPaid: verified, remaining,
      confirmed: verified > 0, partnerId: cu.source_partner_id, partnerName: partner?.full_name, createdAt: cu.created_at,
    };
  });
  return ok({ customers: rows });
}, { roles: FULL });

// ---------- Bookings ----------
route('GET', '/api/admin/bookings', 'admin', async () => {
  const d = await core();
  const names = new Map(d.partners.map(p => [p.id, p.full_name]));
  return ok({
    bookings: d.bookings.map(b => {
      const f = bookingFinance(b as FBooking, d.payments as FPayment[], d.refunds as FRefund[]);
      return {
        id: b.id, ref: b.ref, customer: b.customers?.full_name, mobile: b.customers?.mobile, project: b.inventory_projects?.name,
        plot: b.plots?.plot_number, area: n(b.area_guntha), rate: n(b.rate_per_guntha), calculatedPrice: n(b.calculated_price),
        proposedPrice: n(b.proposed_price), approvedPrice: n(b.approved_price), discountApproval: b.discount_approval,
        bookingDate: b.booking_date, partnerId: b.partner_id, partnerName: names.get(b.partner_id), status: b.status,
        verified: f.net, pending: f.pending, remaining: f.remaining, cancelReason: b.cancel_reason,
      };
    }).reverse(),
  });
}, { roles: FULL });

route('POST', '/api/admin/bookings/:id/discount', 'admin', async (c) => {
  const reason = str(c.body.reason, 300);
  if (!reason) return fail(400, 'invalid', { message: 'A reason is required.' });
  const { error } = await db().rpc('review_discount', { p_booking: c.params.id, p_approve: c.body.approve === true, p_admin: c.admin!.id, p_note: reason });
  if (error) {
    if (error.message.includes('no_pending_discount')) return fail(409, 'rejected', { message: 'No pending price change for this booking.' });
    if (error.message.includes('below_verified')) return fail(409, 'rejected', { message: 'The price cannot be lower than already verified payments.' });
    throw new Error(error.message);
  }
  return ok();
}, { roles: FULL });

route('POST', '/api/admin/bookings/:id/cancel', 'admin', async (c) => {
  const reason = str(c.body.reason, 300);
  if (!reason) return fail(400, 'invalid', { message: 'A reason is required.' });
  const { error } = await db().rpc('cancel_booking', { p_booking: c.params.id, p_admin: c.admin!.id, p_reason: reason });
  if (error) {
    if (error.message.includes('already_cancelled')) return fail(409, 'rejected', { message: 'Booking is already cancelled.' });
    if (error.message.includes('booking_not_found')) return fail(404, 'not_found');
    throw new Error(error.message);
  }
  return ok();
}, { roles: FULL });

route('POST', '/api/admin/bookings/:id/refund', 'admin', async (c) => {
  const a = c.admin!, reason = str(c.body.reason, 300), amount = num(c.body.amount);
  if (!reason || !(amount > 0)) return fail(400, 'invalid', { message: 'Amount and reason are required.' });
  const { data: bk } = await db().from('bookings').select('id, ref').eq('id', c.params.id).maybeSingle();
  if (!bk) return fail(404, 'not_found');
  const [pays, refs] = await Promise.all([
    fetchAll<Row>('payments', 'amount, status', q => q.eq('booking_id', bk.id)),
    fetchAll<Row>('refunds', 'amount, status', q => q.eq('booking_id', bk.id)),
  ]);
  const net = pays.filter(p => p.status === 'Verified').reduce((s, p) => s + n(p.amount), 0) - refs.filter(r => r.status === 'Approved').reduce((s, r) => s + n(r.amount), 0);
  if (amount > net) return fail(400, 'rejected', { message: 'Refund exceeds the verified amount still held for this booking.' });
  await db().from('refunds').insert({ booking_id: bk.id, amount, reason, created_by: a.id });
  await audit({ actorType: 'admin', actorId: a.id, actorLabel: label(a), action: 'booking.refund_approved', entityType: 'booking', entityId: bk.id, before: { netCollected: net }, after: { netCollected: net - amount }, reason });
  return ok();
}, { roles: FULL });

// ---------- Payment verification ----------
route('GET', '/api/admin/payments', 'admin', async (c) => {
  const status = c.query.get('status');
  const [payments, bookings, partners] = await Promise.all([
    fetchAll<Row>('payments', '*', q => (status ? q.eq('status', status) : q).order('submitted_at', { ascending: false })),
    fetchAll<Row>('bookings', 'id, ref, approved_price, status, customers(full_name, mobile), inventory_projects(name), plots(plot_number)'),
    fetchAll<Row>('partners', 'id, full_name'),
  ]);
  const verifiedAll = await fetchAll<Row>('payments', 'booking_id, amount', q => q.eq('status', 'Verified'));
  const bk = new Map(bookings.map(b => [b.id, b])), pn = new Map(partners.map(p => [p.id, p.full_name]));
  const vSum = new Map<string, number>();
  for (const p of verifiedAll) vSum.set(p.booking_id, (vSum.get(p.booking_id) ?? 0) + n(p.amount));
  return ok({
    payments: payments.map(p => {
      const b = bk.get(p.booking_id);
      return {
        id: p.id, ref: p.ref, customer: b?.customers?.full_name, customerMobile: b?.customers?.mobile, bookingRef: b?.ref,
        project: b?.inventory_projects?.name, plot: b?.plots?.plot_number, partnerId: p.partner_id, partnerName: pn.get(p.partner_id),
        type: p.type, amount: n(p.amount), date: p.payment_date, method: p.method, txnRef: p.txn_ref, receipt: p.receipt,
        status: p.status, submittedAt: p.submitted_at, reviewedAt: p.reviewed_at, reviewNote: p.review_note,
        bookingPrice: n(b?.approved_price), bookingVerified: vSum.get(p.booking_id) ?? 0,
      };
    }),
  });
}, { roles: ANY });

route('POST', '/api/admin/payments/:id/review', 'admin', async (c) => {
  const a = c.admin!, decision = c.body.decision === 'Verified' ? 'Verified' : c.body.decision === 'Rejected' ? 'Rejected' : '';
  const note = str(c.body.note, 300);
  if (!decision) return fail(400, 'invalid', { message: 'Invalid decision.' });
  if (decision === 'Rejected' && !note) return fail(400, 'invalid', { message: 'A reason is required to reject a payment.' });
  const { data: pay } = await db().from('payments').select('booking_id').eq('id', c.params.id).maybeSingle();
  const { error } = await db().rpc('review_payment', { p_payment: c.params.id, p_decision: decision, p_admin: a.id, p_note: note || null });
  if (error) {
    if (error.message.includes('already_reviewed')) return fail(409, 'rejected', { message: 'This payment has already been reviewed.' });
    if (error.message.includes('exceeds_price')) return fail(409, 'rejected', { message: 'Verifying this would exceed the approved plot price.' });
    if (error.message.includes('booking_cancelled')) return fail(409, 'rejected', { message: 'This booking is cancelled.' });
    if (error.message.includes('payment_not_found')) return fail(404, 'not_found');
    throw new Error(error.message);
  }
  if (pay) await db().rpc('sync_plot_status', { p_booking: pay.booking_id });
  return ok();
}, { roles: ANY });

// ---------- Site visits ----------
route('GET', '/api/admin/visits', 'admin', async () => {
  const d = await core();
  const pn = new Map(d.partners.map(p => [p.id, p]));
  return ok({
    visits: d.visits.map(v => ({
      id: v.id, ref: v.ref, customer: v.customer_name, mobile: v.mobile, project: v.inventory_projects?.name, date: v.visit_date, time: v.visit_time,
      partnerId: v.partner_id, partnerName: pn.get(v.partner_id)?.full_name, partnerRole: pn.get(v.partner_id)?.role,
      visitors: v.visitors, status: v.status, converted: !!v.booking_id,
    })).reverse(),
  });
}, { roles: FULL });

route('PATCH', '/api/admin/visits/:id', 'admin', async (c) => {
  const status = str(c.body.status);
  if (!['Scheduled', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) return fail(400, 'invalid', { message: 'Invalid status.' });
  const { data: v } = await db().from('site_visits').select('status').eq('id', c.params.id).maybeSingle();
  if (!v) return fail(404, 'not_found');
  if (v.status === 'Converted to Booking') return fail(409, 'rejected', { message: 'Converted visits cannot be changed.' });
  await db().from('site_visits').update({ status }).eq('id', c.params.id);
  await audit({ actorType: 'admin', actorId: c.admin!.id, actorLabel: label(c.admin!), action: 'visit.status_changed', entityType: 'site_visit', entityId: c.params.id, before: { status: v.status }, after: { status } });
  return ok();
}, { roles: FULL });

// ---------- Projects & plots ----------
route('GET', '/api/admin/projects', 'admin', async () => {
  const d = await core();
  const plots = await fetchAll<Row>('plots', 'id, project_id, plot_number, area_guntha, status', q => q.order('plot_number'));
  return ok({ projects: projectPerformance(d, '', '').map(p => ({ ...p, plots: plots.filter(x => x.project_id === p.id).map(x => ({ id: x.id, number: x.plot_number, area: x.area_guntha ? n(x.area_guntha) : null, status: x.status })) })) });
}, { roles: FULL });

route('POST', '/api/admin/projects/:id/plots', 'admin', async (c) => {
  const number = str(c.body.plotNumber, 50), area = c.body.areaGuntha === '' || c.body.areaGuntha == null ? null : num(c.body.areaGuntha);
  if (!number) return fail(400, 'invalid', { message: 'Plot number is required.' });
  if (area !== null && !(area > 0)) return fail(400, 'invalid', { message: 'Area must be greater than zero.' });
  const { error } = await db().from('plots').insert({ project_id: c.params.id, plot_number: number, area_guntha: area });
  if (error) {
    if (error.code === '23505') return fail(409, 'duplicate', { message: 'This plot already exists in the project.' });
    if (error.code === '23503') return fail(404, 'not_found');
    throw new Error(error.message);
  }
  await audit({ actorType: 'admin', actorId: c.admin!.id, actorLabel: label(c.admin!), action: 'plot.added', entityType: 'plot', entityId: number, after: { project: c.params.id, area } });
  return ok();
}, { roles: FULL });

// ---------- Commissions ----------
route('GET', '/api/admin/commissions', 'admin', async () => {
  const d = await core();
  const rows = partnerPerformance(d, '', '').filter(p => p.commission.earned > 0 || p.personalSales > 0);
  const payouts = await fetchAll<Row>('payouts', 'partner_id, amount, paid_at');
  return ok({
    engineAvailable: d.commissions.length > 0,
    note: 'Commission calculation is not yet configured. No commission amounts are shown until records exist.',
    partners: rows.map(p => ({ id: p.id, name: p.name, role: p.role, ...p.commission })),
    totals: {
      earned: d.commissions.reduce((s, c) => s + n(c.amount), 0),
      pending: d.commissions.filter(c => c.status === 'Pending').reduce((s, c) => s + n(c.amount), 0),
      approved: d.commissions.filter(c => c.status === 'Approved').reduce((s, c) => s + n(c.amount), 0),
      paid: d.commissions.filter(c => c.status === 'Paid').reduce((s, c) => s + n(c.amount), 0),
      payouts: payouts.reduce((s, p) => s + n(p.amount), 0),
    },
  });
}, { roles: FULL });

// ---------- Reports ----------
route('GET', '/api/admin/reports', 'admin', async (c) => {
  const from = dateParam(c.query.get('from')), to = dateParam(c.query.get('to'));
  const d = await core();
  const daily = new Map<string, { date: string; bookings: number; sales: number; collections: number }>();
  const day = (k: string) => daily.get(k) ?? (daily.set(k, { date: k, bookings: 0, sales: 0, collections: 0 }), daily.get(k)!);
  for (const b of d.bookings) if (b.status === 'Confirmed' && inRange(b.booking_date, from, to)) { const r = day(b.booking_date); r.bookings++; r.sales += n(b.approved_price); }
  for (const p of d.payments) if (p.status === 'Verified' && inRange(p.reviewed_at, from, to)) day(p.reviewed_at.slice(0, 10)).collections += n(p.amount);
  for (const r of d.refunds) if (r.status === 'Approved' && inRange(r.created_at, from, to)) day(r.created_at.slice(0, 10)).collections -= n(r.amount);
  const monthly = new Map<string, { month: string; bookings: number; sales: number; collections: number }>();
  for (const r of daily.values()) {
    const m = monthly.get(r.date.slice(0, 7)) ?? { month: r.date.slice(0, 7), bookings: 0, sales: 0, collections: 0 };
    m.bookings += r.bookings; m.sales += r.sales; m.collections += r.collections; monthly.set(m.month, m);
  }
  const outstanding = d.bookings.filter(b => b.status === 'Confirmed').map(b => {
    const f = bookingFinance(b as FBooking, d.payments as FPayment[], d.refunds as FRefund[]);
    return { ref: b.ref, customer: b.customers?.full_name, mobile: b.customers?.mobile, project: b.inventory_projects?.name, plot: b.plots?.plot_number, price: n(b.approved_price), collected: f.net, remaining: f.remaining, partnerId: b.partner_id };
  }).filter(r => r.remaining > 0);
  const vis = d.visits.filter(v => inRange(v.visit_date, from, to));
  const conv = vis.filter(v => v.booking_id).length;
  const pn = new Map(d.partners.map(p => [p.id, p.full_name]));
  const byPartner = new Map<string, { partnerId: string; partnerName: string; visits: number; converted: number }>();
  for (const v of vis) {
    const r = byPartner.get(v.partner_id) ?? { partnerId: v.partner_id, partnerName: pn.get(v.partner_id) ?? v.partner_id, visits: 0, converted: 0 };
    r.visits++; if (v.booking_id) r.converted++; byPartner.set(v.partner_id, r);
  }
  return ok({
    range: { from, to },
    daily: [...daily.values()].sort((a, b) => a.date.localeCompare(b.date)),
    monthly: [...monthly.values()].sort((a, b) => a.month.localeCompare(b.month)),
    outstanding,
    partners: partnerPerformance(d, from, to),
    projects: projectPerformance(d, from, to),
    visitConversion: { visits: vis.length, converted: conv, rate: vis.length ? Math.round((conv / vis.length) * 1000) / 10 : 0, byPartner: [...byPartner.values()] },
  });
}, { roles: FULL });

// ---------- Audit log ----------
route('GET', '/api/admin/audit', 'admin', async (c) => {
  const action = c.query.get('action');
  const limit = Math.min(500, Math.max(1, Number(c.query.get('limit')) || 200));
  let q = db().from('audit_logs').select('*').order('id', { ascending: false }).limit(limit);
  if (action) q = q.eq('action', action);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return ok({ logs: (data ?? []).map(l => ({ id: l.id, at: l.created_at, actor: l.actor_label ?? l.actor_type, actorType: l.actor_type, action: l.action, entity: `${l.entity_type}${l.entity_id ? ' ' + l.entity_id : ''}`, before: l.before_value, after: l.after_value, reason: l.reason })) });
}, { roles: FULL });

// ---------- User management (admin accounts) ----------
route('GET', '/api/admin/users', 'admin', async () => {
  const { data, error } = await db().from('admin_users').select('id, email, full_name, role, is_active, must_change_password, created_at, last_login_at').order('created_at');
  if (error) throw new Error(error.message);
  return ok({ users: data });
}, { roles: SUPER });

route('POST', '/api/admin/users', 'admin', async (c) => {
  const email = str(c.body.email, 200).toLowerCase(), name = str(c.body.fullName, 100), role = str(c.body.role);
  const pw = typeof c.body.temporaryPassword === 'string' ? c.body.temporaryPassword : '';
  if (!EMAIL_RE.test(email) || !name || !['admin', 'finance'].includes(role)) return fail(400, 'invalid', { message: 'Name, a valid email and role (Admin or Finance) are required.' });
  if (!strongAdminPassword(pw)) return fail(400, 'weak', { message: 'Temporary password needs 10+ characters with upper-case, lower-case and a number.' });
  const { data, error } = await db().from('admin_users').insert({ email, full_name: name, role, password_hash: await hashPassword(pw), must_change_password: true }).select('id').single();
  if (error) {
    if (error.code === '23505') return fail(409, 'duplicate', { message: 'An admin with this email already exists.' });
    throw new Error(error.message);
  }
  await audit({ actorType: 'admin', actorId: c.admin!.id, actorLabel: label(c.admin!), action: 'admin_user.created', entityType: 'admin_user', entityId: data.id, after: { email, role } });
  return ok();
}, { roles: SUPER });

route('PATCH', '/api/admin/users/:id', 'admin', async (c) => {
  if (c.params.id === c.admin!.id) return fail(400, 'invalid', { message: 'You cannot change your own access.' });
  const { data: u } = await db().from('admin_users').select('id, email, role, is_active').eq('id', c.params.id).maybeSingle();
  if (!u) return fail(404, 'not_found');
  const patch: Row = {};
  if (typeof c.body.isActive === 'boolean') patch.is_active = c.body.isActive;
  if (c.body.role !== undefined) { if (!['super_admin', 'admin', 'finance'].includes(c.body.role)) return fail(400, 'invalid'); patch.role = c.body.role; }
  if (!Object.keys(patch).length) return fail(400, 'invalid');
  await db().from('admin_users').update(patch).eq('id', u.id);
  if (patch.is_active === false) await destroyAllSessions('admin', u.id);
  await audit({ actorType: 'admin', actorId: c.admin!.id, actorLabel: label(c.admin!), action: 'admin_user.updated', entityType: 'admin_user', entityId: u.id, before: { role: u.role, is_active: u.is_active }, after: patch });
  return ok();
}, { roles: SUPER });

export { rpcMessage };
