// SMS delivery for OTPs. Provider: MSG91 "Flow" API (common for Indian DLT-registered OTP templates).
// Required env (server only):  MSG91_AUTH_KEY, MSG91_OTP_TEMPLATE_ID
// The template must contain a variable named "otp" (##otp##).
// Without those vars: in local dev the code is printed to the server console; in production sending
// is refused so a reset can never silently "succeed" without delivering anything.
export const smsConfigured = () => !!(process.env.MSG91_AUTH_KEY && process.env.MSG91_OTP_TEMPLATE_ID);

export async function sendOtpSms(mobile: string, otp: string): Promise<boolean> {
  if (!smsConfigured()) {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      console.error('[sms] MSG91_AUTH_KEY / MSG91_OTP_TEMPLATE_ID are not configured');
      return false;
    }
    console.log(`[sms:dev] OTP for ${mobile}: ${otp}`); // local development only
    return true;
  }
  try {
    const r = await fetch('https://control.msg91.com/api/v5/flow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authkey: process.env.MSG91_AUTH_KEY! },
      body: JSON.stringify({ template_id: process.env.MSG91_OTP_TEMPLATE_ID, recipients: [{ mobiles: `91${mobile}`, otp }] }),
    });
    if (!r.ok) console.error('[sms] provider responded', r.status);
    return r.ok;
  } catch (e) {
    console.error('[sms] send failed', e instanceof Error ? e.message : 'error');
    return false;
  }
}
