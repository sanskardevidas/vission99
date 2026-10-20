import { db, fetchAll } from './db.ts';
import { audit } from './audit.ts';
import { descendantsOf } from './finance.ts';
import { PARTNER_COLS, fail, ok, route, type Ctx, type Partner } from './router.ts';
import { CASH_LIMIT, EMAIL_RE, PAYMENT_METHODS, normalizeMobile, num, str } from './validate.ts';

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const partnerOut = (p: Row) => ({
  id: p.id, name: p.full_name, mobile: p.mobile, role: p.role, referredBy: p.referred_by,
  joinedAt: p.joined_at, status: p.status, kycStatus: p.kyc_status, kycDetails: p.kyc_details ?? undefined,
});

// CP sees only its own records; PP / Manager also see their referral team's (existing rule).
async function scopeOf(me: Partner) {
  const all = await fetchAll<Row>('partners', PARTNER_COLS);
  const ids = me.role === 'CP' ? [me.id] : [me.id, ...descendantsOf(all as { id: string; referred_by: string | null }[], me.id)];
  const idSet = new Set(ids);
  const referrer = me.referred_by ? all.find(p => p.id === me.referred_by) : undefined;
  const visible = all.filter(p => idSet.has(p.id) || p.id === referrer?.id);
  return { all, idSet, visible, ids };
}

route('GET', '/api/partner/state', 'partner', async (c) => {
  const me = c.partner!;
  const { all, idSet, visible, ids } = await scopeOf(me);
  // Hierarchy view uses the full downline for every role (CP downline is shown on its dashboard too).
  const down = new Set([me.id, ...descendantsOf(all as { id: string; referred_by: string | null }[], me.id)]);
  const team = all.filter(p => down.has(p.id) || idSet.has(p.id) || p.id === me.referred_by);
  const names = new Map(all.map(p => [p.id, p]));

  const [projects, hist, visits, bookings] = await Promise.all([
    fetchAll<Row>('inventory_projects', 'id, name', q => q.eq('status', 'Active').order('name')),
    fetchAll<Row>('partner_role_history', 'id, partner_id, from_role, to_role, created_at, celebration_shown', q => q.eq('partner_id', me.id).eq('reason', 'auto_promotion').order('id')),
    fetchAll<Row>('site_visits', '*, inventory_projects(name)', q => q.in('partner_id', ids).order('created_at')),
    fetchAll<Row>('bookings', '*, customers(full_name, mobile, email, address), inventory_projects(name), plots(plot_number), site_visits!bookings_visit_id_fkey(ref)', q => q.in('partner_id', ids).order('created_at')),
  ]);
  const bookingIds = bookings.map(b => b.id);
  const payments = bookingIds.length
    ? await fetchAll<Row>('payments', '*', q => q.in('booking_id', bookingIds).order('submitted_at'))
    : [];
  const who = (id: string) => ({ partnerName: names.get(id)?.full_name ?? id, partnerRole: names.get(id)?.role });

  return ok({
    partner: { ...partnerOut(me), celebrations: hist.map(h => ({ id: String(h.id), from: h.from_role, to: h.to_role, at: h.created_at, shown: h.celebration_shown })) },
    partners: [...new Map([...visible, ...team].map(p => [p.id, p])).values()].map(partnerOut),
    projects: projects.map(p => p.name),
    visits: visits.map(v => ({
      id: v.id, ref: v.ref, customerName: v.customer_name, mobile: v.mobile, email: v.email ?? undefined,
      project: v.inventory_projects?.name, date: v.visit_date, time: v.visit_time, visitors: v.visitors, notes: v.notes ?? undefined,
      status: v.status, partnerId: v.partner_id, ...who(v.partner_id), createdAt: v.created_at, bookingId: v.booking_id ?? undefined,
    })),
    bookings: bookings.map(b => ({
      id: b.id, ref: b.ref, visitId: b.visit_id ?? undefined, visitRef: b.site_visits?.ref ?? undefined,
      customerName: b.customers?.full_name, mobile: b.customers?.mobile, email: b.customers?.email ?? undefined, address: b.customers?.address ?? undefined,
      project: b.inventory_projects?.name, plotNumber: b.plots?.plot_number, areaGuntha: Number(b.area_guntha), ratePerGuntha: Number(b.rate_per_guntha),
      calculatedPrice: Number(b.calculated_price), finalPrice: Number(b.proposed_price), discountApproval: b.discount_approval,
      bookingDate: b.booking_date, cancelled: b.status === 'Cancelled' || undefined,
      partnerId: b.partner_id, ...who(b.partner_id), createdAt: b.created_at,
    })),
    payments: payments.map(p => ({
      id: p.id, ref: p.ref, bookingId: p.booking_id, type: p.type, amount: Number(p.amount), date: p.payment_date, method: p.method,
      txnRef: p.txn_ref, receipt: p.receipt ?? undefined, status: p.status, submittedBy: p.partner_id, submittedAt: p.submitted_at,
      verifiedAt: p.reviewed_at ?? undefined,
    })),
  });
});

// ---------- Site visits ----------
async function projectByName(name: string) {
  const { data } = await db().from('inventory_projects').select('id').eq('name', name).eq('status', 'Active').maybeSingle();
  return data?.id as string | undefined;
}

route('POST', '/api/partner/visits', 'partner', async (c) => {
  const me = c.partner!, b = c.body;
  const name = str(b.customerName, 100), mobile = normalizeMobile(b.mobile), email = str(b.email, 200);
  if (!name) return fail(400, 'invalid', { message: 'Customer full name is required.' });
  if (!mobile) return fail(400, 'invalid', { message: 'Enter a valid 10-digit mobile number.' });
  if (email && !EMAIL_RE.test(email)) return fail(400, 'invalid', { message: 'Enter a valid email address or leave it blank.' });
  const projectId = await projectByName(str(b.project));
  if (!projectId) return fail(400, 'invalid', { message: 'Select a project.' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str(b.date))) return fail(400, 'invalid', { message: 'Visit date is required.' });
  if (!/^\d{2}:\d{2}$/.test(str(b.time))) return fail(400, 'invalid', { message: 'Preferred visit time is required.' });
  const visitors = num(b.visitors);
  if (!Number.isInteger(visitors) || visitors < 1 || visitors > 500) return fail(400, 'invalid', { message: 'Number of visitors must be at least 1.' });
  const { data, error } = await db().from('site_visits').insert({
    customer_name: name, mobile, email: email || null, project_id: projectId, visit_date: str(b.date), visit_time: str(b.time),
    visitors, notes: str(b.notes, 1000) || null, partner_id: me.id, // attribution comes from the session only
  }).select('id, ref').single();
  if (error) throw new Error(error.message);
  return ok({ ok: true, id: data.id, ref: data.ref });
});

route('PATCH', '/api/partner/visits/:id', 'partner', async (c) => {
  const status = str(c.body.status);
  if (!['Scheduled', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) return fail(400, 'invalid', { message: 'Use Convert to Booking to convert a visit.' });
  const { data: v } = await db().from('site_visits').select('partner_id, status').eq('id', c.params.id).maybeSingle();
  if (!v || v.partner_id !== c.partner!.id) return fail(403, 'forbidden', { message: 'You can only update your own site visits.' });
  if (v.status === 'Converted to Booking') return fail(400, 'invalid', { message: 'This visit has already been converted to a booking.' });
  await db().from('site_visits').update({ status }).eq('id', c.params.id);
  return ok();
});

// ---------- Payments & bookings ----------
function validatePaymentFields(b: Row): { error?: string; amount: number; date: string; method: string; txn: string } {
  const amount = num(b.amount), date = str(b.date), method = str(b.method), txn = str(b.txnRef, 100);
  const bad = (error: string) => ({ error, amount, date, method, txn });
  if (!(amount > 0)) return bad('Payment amount must be greater than zero.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return bad('Payment date is required.');
  if (new Date(date) > new Date()) return bad('Payment date cannot be in the future.');
  if (!PAYMENT_METHODS.includes(method)) return bad('Select a payment method.');
  if (method === 'Cash' && amount > CASH_LIMIT) return bad(`Cash payments above ₹${CASH_LIMIT.toLocaleString('en-IN')} are not permitted. Use a bank method.`);
  if (!txn) return bad('Transaction reference number is required.');
  return { amount, date, method, txn };
}

const RPC_ERRORS: Record<string, string> = {
  plot_taken: 'This plot already has an active booking.',
  exceeds_price: 'This payment exceeds the remaining balance for the plot.',
  visit_not_yours: 'You can only convert your own site visits.',
  visit_converted: 'This visit has already been converted to a booking.',
  visit_cancelled: 'A cancelled visit cannot be converted.',
};
const DUP_TXN = 'A payment with this transaction reference has already been submitted.';
export function rpcMessage(msg: string): string | null {
  for (const k of Object.keys(RPC_ERRORS)) if (msg.includes(k)) return RPC_ERRORS[k];
  if (msg.includes('payments_txn_ref_active_uidx')) return DUP_TXN;
  return null;
}

route('POST', '/api/partner/bookings', 'partner', async (c: Ctx) => {
  const me = c.partner!, b = c.body;
  const visitId = str(b.visitId) || null;
  const mobile = normalizeMobile(b.mobile), name = str(b.customerName, 100), email = str(b.email, 200);
  const projectId = await projectByName(str(b.project));
  const plot = str(b.plotNumber, 50), area = num(b.areaGuntha), rate = num(b.ratePerGuntha), final = num(b.finalPrice);
  if (!visitId) {
    if (!name) return fail(400, 'invalid', { message: 'Customer full name is required.' });
    if (!mobile) return fail(400, 'invalid', { message: 'Enter a valid 10-digit mobile number.' });
    if (!projectId) return fail(400, 'invalid', { message: 'Select a project.' });
  }
  if (email && !EMAIL_RE.test(email)) return fail(400, 'invalid', { message: 'Enter a valid email address.' });
  if (!plot) return fail(400, 'invalid', { message: 'Plot number is required.' });
  if (!(area > 0)) return fail(400, 'invalid', { message: 'Land area must be greater than zero.' });
  if (!(rate > 0)) return fail(400, 'invalid', { message: 'Rate per Guntha must be greater than zero.' });
  if (!(final > 0)) return fail(400, 'invalid', { message: 'Final agreed price must be greater than zero.' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str(b.bookingDate))) return fail(400, 'invalid', { message: 'Booking date is required.' });
  let adv: ReturnType<typeof validatePaymentFields> | null = null;
  if (b.advance) {
    adv = validatePaymentFields(b.advance);
    if (adv.error) return fail(400, 'invalid', { message: adv.error });
  }
  const { data, error } = await db().rpc('create_booking', {
    p_partner: me.id, p_visit: visitId, p_name: name, p_mobile: mobile, p_email: email || null, p_address: str(b.address, 300) || null,
    p_project: projectId ?? null, p_plot: plot, p_area: area, p_rate: rate, p_final: final, p_date: str(b.bookingDate),
    p_adv_amount: adv?.amount ?? null, p_adv_date: adv?.date ?? null, p_adv_method: adv?.method ?? null,
    p_adv_txn: adv?.txn ?? null, p_adv_receipt: str(b.advance?.receipt, 300) || null,
  });
  if (error) {
    const m = rpcMessage(error.message);
    if (m) return fail(400, 'rejected', { message: m });
    throw new Error(error.message);
  }
  return ok({ ok: true, bookingId: data.booking_id });
});

route('POST', '/api/partner/payments', 'partner', async (c) => {
  const me = c.partner!;
  const bookingId = str(c.body.bookingId);
  const { data: bk } = await db().from('bookings').select('id, partner_id, status, approved_price').eq('id', bookingId).maybeSingle();
  if (!bk || bk.partner_id !== me.id) return fail(403, 'forbidden', { message: 'You can only add payments to your own bookings.' });
  if (bk.status === 'Cancelled') return fail(400, 'invalid', { message: 'This booking is cancelled.' });
  const v = validatePaymentFields(c.body);
  if (v.error) return fail(400, 'invalid', { message: v.error });
  const type = str(c.body.type);
  if (!['Installment', 'Final Payment'].includes(type)) return fail(400, 'invalid', { message: 'Select a payment type.' });
  const { data: existing } = await db().from('payments').select('amount').eq('booking_id', bk.id).neq('status', 'Rejected');
  const committed = (existing ?? []).reduce((s, p) => s + Number(p.amount), 0);
  if (committed + v.amount > Number(bk.approved_price)) return fail(400, 'rejected', { message: 'This payment exceeds the remaining balance for the plot.' });
  const { error } = await db().from('payments').insert({
    booking_id: bk.id, partner_id: me.id, type, amount: v.amount, payment_date: v.date, method: v.method, txn_ref: v.txn,
    receipt: str(c.body.receipt, 300) || null,
  });
  if (error) {
    const m = rpcMessage(error.message);
    if (m) return fail(400, 'rejected', { message: m });
    throw new Error(error.message);
  }
  return ok();
});

// KYC is not collected at launch: there is deliberately no endpoint that can mark an account verified.

route('POST', '/api/partner/celebrations/:id/shown', 'partner', async (c) => {
  await db().from('partner_role_history').update({ celebration_shown: true })
    .eq('id', Number(c.params.id)).eq('partner_id', c.partner!.id);
  return ok();
});
