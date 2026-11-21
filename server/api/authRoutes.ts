import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { db } from '../api/db.ts';
import { sendOtpSms, smsConfigured } from './sms.ts';
import { audit } from './audit.ts';
import { PARTNER_COLS, fail, ok, route } from './router.ts';
import {
  COOKIE, SESSION_TTL_S, cookieHeader, createSession, destroyAllSessions, destroySession, hashPassword,
  isThrottled, recordAttempt, verifyPassword,
} from './security.ts';
import { PARTNER_PASSWORD_MIN, EMAIL_RE, normalizeMobile, str, strongAdminPassword } from './validate.ts';

const INVALID = 'Invalid mobile number or password.';
const ADMIN_INVALID = 'Invalid email or password.';
const THROTTLED = 'Too many attempts. Please try again in 15 minutes.';

// ---------- Partner: register (mobile + password only; no email, no OTP) ----------
route('POST', '/api/auth/register', 'none', async (c) => {
  const name = str(c.body.name, 100);
  const mobile = normalizeMobile(c.body.mobile);
  const password = typeof c.body.password === 'string' ? c.body.password : '';
  const refId = str(c.body.refId, 30);
  if (!name) return fail(400, 'invalid', { message: 'Full name is required.' });
  if (!mobile) return fail(400, 'invalid', { message: 'Enter a valid 10-digit Indian mobile number.' });
  if (password.length < PARTNER_PASSWORD_MIN) return fail(400, 'invalid', { message: `Password must be at least ${PARTNER_PASSWORD_MIN} characters.` });
  if (await isThrottled('register', c.ip, c.ip, 60, 60)) return fail(429, 'throttled', { message: 'Too many registration attempts. Please try again later.' });
  await recordAttempt('register', c.ip, c.ip, false);

  let referredBy: string | null = null;
  if (refId) {
    const { data: ref } = await db().from('partners').select('id, status').ilike('id', refId).maybeSingle();
    if (!ref || ref.status !== 'Active') return fail(400, 'invalid', { message: 'Invalid referral ID.' });
    referredBy = ref.id;
  }
  const { data, error } = await db().from('partners')
    .insert({ full_name: name, mobile, password_hash: await hashPassword(password), referred_by: referredBy })
    .select('id').single();
  if (error) {
    if (error.code === '23505') return fail(409, 'duplicate', { message: 'This mobile number is already registered. Please log in.' });
    throw new Error(error.message);
  }
  await db().from('partner_role_history').insert({ partner_id: data.id, from_role: null, to_role: 'CP', reason: 'registration' });
  const r = await db().rpc('run_promotions');
  if (r.error) throw new Error(r.error.message);
  await audit({ actorType: 'system', action: 'partner.registered', entityType: 'partner', entityId: data.id, after: { referred_by: referredBy } });
  // Free registration: the account is active immediately, so sign the new partner straight in.
  const token = await createSession('partner', data.id);
  return ok({ ok: true, partnerId: data.id, role: 'CP' }, [cookieHeader(COOKIE.partner, token, SESSION_TTL_S.partner, c.secure)]);
});

// ---------- Partner: login ----------
route('POST', '/api/auth/login', 'none', async (c) => {
  const mobile = normalizeMobile(c.body.mobile);
  const password = typeof c.body.password === 'string' ? c.body.password : '';
  const key = mobile ?? str(c.body.mobile, 40) ?? 'invalid';
  if (await isThrottled('partner', key, c.ip)) return fail(429, 'throttled', { message: THROTTLED });
  const { data: p } = mobile
    ? await db().from('partners').select('id, password_hash, status, role').eq('mobile', mobile).maybeSingle()
    : { data: null };
  const good = await verifyPassword(password, p?.password_hash ?? null);
  if (!p || !good || p.status !== 'Active') {
    await recordAttempt('partner', key, c.ip, false);
    return fail(401, 'invalid_credentials', { message: INVALID });
  }
  await recordAttempt('partner', key, c.ip, true);
  const token = await createSession('partner', p.id);
  return ok({ ok: true, role: p.role }, [cookieHeader(COOKIE.partner, token, SESSION_TTL_S.partner, c.secure)]);
});

// ---------- Partner: forgot password (SMS OTP) ----------
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const otpHash = (partnerId: string, code: string) => createHash('sha256').update(`${partnerId}:${code}`).digest('hex');
const OTP_SENT = 'If this mobile number is registered, a 6-digit code has been sent by SMS.';

route('POST', '/api/auth/forgot/request', 'none', async (c) => {
  const mobile = normalizeMobile(c.body.mobile);
  if (!mobile) return fail(400, 'invalid', { message: 'Enter a valid 10-digit Indian mobile number.' });
  if (!smsConfigured() && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
    return fail(503, 'sms_unavailable', { message: 'Password reset by SMS is not available right now. Please contact support.' });
  }
  if (await isThrottled('otp', mobile, c.ip, 3, 10)) return fail(429, 'throttled', { message: THROTTLED });
  await recordAttempt('otp', mobile, c.ip, false);

  const { data: p } = await db().from('partners').select('id, status').eq('mobile', mobile).maybeSingle();
  if (p && p.status === 'Active') {
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await db().from('password_reset_otps').update({ consumed: true }).eq('partner_id', p.id).eq('consumed', false);
    const { error } = await db().from('password_reset_otps')
      .insert({ partner_id: p.id, code_hash: otpHash(p.id, code), expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString() });
    if (error) throw new Error(error.message);
    await sendOtpSms(mobile, code);
  }
  // Same response whether or not the number is registered (no account enumeration).
  return ok({ ok: true, message: OTP_SENT });
});

route('POST', '/api/auth/forgot/reset', 'none', async (c) => {
  const mobile = normalizeMobile(c.body.mobile);
  const code = str(c.body.otp, 10);
  const password = typeof c.body.password === 'string' ? c.body.password : '';
  const BAD = 'Invalid or expired code. Please request a new one.';
  if (!mobile || !/^\d{6}$/.test(code)) return fail(400, 'invalid', { message: BAD });
  if (password.length < PARTNER_PASSWORD_MIN) return fail(400, 'invalid', { message: `Password must be at least ${PARTNER_PASSWORD_MIN} characters.` });
  if (await isThrottled('otp-verify', mobile, c.ip, 5, 20)) return fail(429, 'throttled', { message: THROTTLED });

  const { data: p } = await db().from('partners').select('id, status').eq('mobile', mobile).maybeSingle();
  const { data: row } = p
    ? await db().from('password_reset_otps').select('id, code_hash, attempts, expires_at')
        .eq('partner_id', p.id).eq('consumed', false).order('created_at', { ascending: false }).limit(1).maybeSingle()
    : { data: null };
  if (!p || p.status !== 'Active' || !row) {
    await recordAttempt('otp-verify', mobile, c.ip, false);
    return fail(400, 'invalid_otp', { message: BAD });
  }
  const { data: claimed } = await db().rpc('claim_otp_attempt', { p_id: row.id, p_max: OTP_MAX_ATTEMPTS });
  if (claimed !== true) {
    await recordAttempt('otp-verify', mobile, c.ip, false);
    return fail(400, 'invalid_otp', { message: BAD });
  }
  const match = timingSafeEqual(Buffer.from(row.code_hash, 'hex'), Buffer.from(otpHash(p.id, code), 'hex'));
  if (!match) {
    await recordAttempt('otp-verify', mobile, c.ip, false);
    return fail(400, 'invalid_otp', { message: BAD });
  }
  await db().from('password_reset_otps').update({ consumed: true }).eq('id', row!.id);
  await db().from('partners').update({ password_hash: await hashPassword(password) }).eq('id', p!.id);
  await destroyAllSessions('partner', p!.id); // sign out every device
  await recordAttempt('otp-verify', mobile, c.ip, true);
  await audit({ actorType: 'partner', actorId: p!.id, action: 'partner.password_reset', entityType: 'partner', entityId: p!.id });
  return ok();
});

route('POST', '/api/auth/logout', 'none', async (c) => {
  await destroySession(c.tokens.partner);
  return ok({ ok: true }, [cookieHeader(COOKIE.partner, '', 0, c.secure)]);
});

// Public: lets the registration page show who referred the user. Returns the name only.
route('GET', '/api/referrer/:id', 'none', async (c) => {
  const { data } = await db().from('partners').select('id, full_name, status').ilike('id', c.params.id).maybeSingle();
  if (!data || data.status !== 'Active') return fail(404, 'not_found');
  return ok({ id: data.id, name: data.full_name });
});

// ---------- Admin: email + password ----------
route('POST', '/api/admin/login', 'none', async (c) => {
  const email = str(c.body.email, 200).toLowerCase();
  const password = typeof c.body.password === 'string' ? c.body.password : '';
  const key = EMAIL_RE.test(email) ? email : 'invalid';
  if (await isThrottled('admin', key, c.ip)) return fail(429, 'throttled', { message: THROTTLED });
  const { data: a } = key !== 'invalid'
    ? await db().from('admin_users').select('id, password_hash, is_active, must_change_password, role').eq('email', email).maybeSingle()
    : { data: null };
  const good = await verifyPassword(password, a?.password_hash ?? null);
  if (!a || !good || !a.is_active) {
    await recordAttempt('admin', key, c.ip, false);
    return fail(401, 'invalid_credentials', { message: ADMIN_INVALID });
  }
  await recordAttempt('admin', key, c.ip, true);
  await db().from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', a.id);
  const token = await createSession('admin', a.id);
  await audit({ actorType: 'admin', actorId: a.id, actorLabel: email, action: 'admin.login', entityType: 'admin', entityId: a.id });
  return ok({ ok: true, mustChangePassword: a.must_change_password }, [cookieHeader(COOKIE.admin, token, SESSION_TTL_S.admin, c.secure, true)]);
});

route('POST', '/api/admin/logout', 'none', async (c) => {
  await destroySession(c.tokens.admin);
  return ok({ ok: true }, [cookieHeader(COOKIE.admin, '', 0, c.secure, true)]);
});

route('GET', '/api/admin/me', 'admin', async (c) => {
  const a = c.admin!;
  return ok({ id: a.id, email: a.email, name: a.full_name, role: a.role, mustChangePassword: a.must_change_password });
}, { allowMustChange: true });

route('POST', '/api/admin/change-password', 'admin', async (c) => {
  const a = c.admin!;
  const current = typeof c.body.currentPassword === 'string' ? c.body.currentPassword : '';
  const next = typeof c.body.newPassword === 'string' ? c.body.newPassword : '';
  if (!strongAdminPassword(next)) return fail(400, 'weak', { message: 'Use at least 10 characters with upper-case, lower-case and a number.' });
  if (await isThrottled('admin-pw', a.id, c.ip)) return fail(429, 'throttled', { message: THROTTLED });
  const { data } = await db().from('admin_users').select('password_hash').eq('id', a.id).single();
  if (!(await verifyPassword(current, data?.password_hash ?? null))) {
    await recordAttempt('admin-pw', a.id, c.ip, false);
    return fail(401, 'invalid_credentials', { message: 'Current password is incorrect.' });
  }
  if (current === next) return fail(400, 'same', { message: 'Choose a password different from the current one.' });
  await db().from('admin_users').update({ password_hash: await hashPassword(next), must_change_password: false }).eq('id', a.id);
  await destroyAllSessions('admin', a.id, c.tokens.admin); // sign out other devices
  await audit({ actorType: 'admin', actorId: a.id, actorLabel: a.email, action: 'admin.password_changed', entityType: 'admin', entityId: a.id });
  return ok();
}, { allowMustChange: true });

export { PARTNER_COLS };
