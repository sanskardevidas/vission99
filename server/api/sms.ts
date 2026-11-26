// SMS delivery for OTPs. Provider: MSG91 "Flow" API (common for Indian DLT-registered OTP templates).
// Required env (server only):  MSG91_AUTH_KEY, MSG91_OTP_TEMPLATE_ID
// The template must contain a variable named "otp" (##otp##).
// Without those vars: in local dev the code is printed to the server console; in production sending
// is refused so a reset can never silently "succeed" without delivering anything.
export const smsConfigured = () => !!(process.env.MSG91_AUTH_KEY && process.env.MSG91_OTP_TEMPLATE_ID);

export type Msg91Result =
  | { ok: true; status: number; requestId: string }
  | { ok: false; status: number | null; error: string }; // status is null when no HTTP response arrived

// One call to MSG91. Callers must check smsConfigured() first.
// MSG91 can answer HTTP 200 with {"type":"error","message":"..."}, so only type "success" counts.
export async function sendViaMsg91(mobile: string, otp: string): Promise<Msg91Result> {
  const authKey = process.env.MSG91_AUTH_KEY!;
  // Error text is logged, so strip the secrets in case the provider (or fetch) echoes them back.
  const clean = (s: string) => s.replaceAll(authKey, '[redacted]').replaceAll(otp, '[redacted]').slice(0, 300);
  let status: number | null = null;
  try {
    const r = await fetch('https://control.msg91.com/api/v5/flow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', authkey: authKey },
      body: JSON.stringify({ template_id: process.env.MSG91_OTP_TEMPLATE_ID, recipients: [{ mobiles: `91${mobile}`, otp }] }),
    });
    status = r.status;
    const body = (await r.json().catch(() => null)) as { type?: unknown; message?: unknown } | null;
    const message = typeof body?.message === 'string' ? body.message : body?.message ? JSON.stringify(body.message) : '';
    if (r.ok && body?.type === 'success') return { ok: true, status: r.status, requestId: message };
    const fallback = body ? 'no error message in response' : 'response was not JSON';
    return { ok: false, status, error: clean(message || fallback) };
  } catch (e) {
    return { ok: false, status, error: clean(e instanceof Error ? e.message : 'error') };
  }
}

export async function sendOtpSms(mobile: string, otp: string): Promise<boolean> {
  if (!smsConfigured()) {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      console.error('[sms] MSG91_AUTH_KEY / MSG91_OTP_TEMPLATE_ID are not configured');
      return false;
    }
    console.log(`[sms:dev] OTP for ${mobile}: ${otp}`); // local development only
    return true;
  }
  const result = await sendViaMsg91(mobile, otp);
  if (!result.ok) console.error('[sms] send failed', result.status ?? 'no response', result.error);
  return result.ok;
}
