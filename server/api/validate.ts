// Canonical Indian mobile: 10 digits starting 6-9. Accepts 10-digit, 0-prefixed, +91 / 91-prefixed input.
export function normalizeMobile(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  let d = input.replace(/[\s-]/g, '');
  if (d.startsWith('+91')) d = d.slice(3);
  else if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}
export const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
export const PAYMENT_METHODS = ['UPI', 'Bank Transfer', 'RTGS', 'NEFT', 'IMPS', 'Cheque', 'Cash'];
export const CASH_LIMIT = 200000;
export const PARTNER_PASSWORD_MIN = 8;
export const strongAdminPassword = (p: string) => p.length >= 10 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p);

export const str = (v: unknown, max = 200): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : Number.NaN);
