import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { db } from './db.ts';

// ---------- Password hashing (scrypt, per-user salt; never plaintext) ----------
const KEYLEN = 64;
const scryptAsync = (pw: string, salt: Buffer) =>
  new Promise<Buffer>((res, rej) => scrypt(pw, salt, KEYLEN, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (e, k) => (e ? rej(e) : res(k))));

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('hex')}$${(await scryptAsync(pw, salt)).toString('hex')}`;
}
let dummy: Promise<string> | null = null;
export async function verifyPassword(pw: string, stored: string | null): Promise<boolean> {
  // Always do the same work so unknown accounts are not distinguishable by timing.
  const hash = stored ?? (await (dummy ??= hashPassword('not-a-real-password')));
  const [, saltHex, hashHex] = hash.split('$');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(pw, Buffer.from(saltHex, 'hex'));
  return timingSafeEqual(expected, actual) && stored !== null;
}

// ---------- Sessions (opaque random token; only its SHA-256 is stored) ----------
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
export const COOKIE = { partner: 'v99_partner', admin: 'v99_admin' } as const;
export const SESSION_TTL_S = { partner: 7 * 24 * 3600, admin: 8 * 3600 } as const;

export async function createSession(kind: 'partner' | 'admin', subject: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const { error } = await db().from('sessions').insert({
    token_hash: sha(token), kind,
    partner_id: kind === 'partner' ? subject : null,
    admin_id: kind === 'admin' ? subject : null,
    expires_at: new Date(Date.now() + SESSION_TTL_S[kind] * 1000).toISOString(),
  });
  if (error) throw new Error(error.message);
  return token;
}
export async function resolveSession(kind: 'partner' | 'admin', token: string | undefined): Promise<string | null> {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const { data } = await db().from('sessions').select('partner_id, admin_id, expires_at')
    .eq('token_hash', sha(token)).eq('kind', kind).maybeSingle();
  if (!data || new Date(data.expires_at) < new Date()) return null;
  return (kind === 'partner' ? data.partner_id : data.admin_id) as string;
}
export async function destroySession(token: string | undefined) {
  if (token) await db().from('sessions').delete().eq('token_hash', sha(token));
}
export async function destroyAllSessions(kind: 'partner' | 'admin', subject: string, exceptToken?: string) {
  let q = db().from('sessions').delete().eq(kind === 'partner' ? 'partner_id' : 'admin_id', subject);
  if (exceptToken) q = q.neq('token_hash', sha(exceptToken));
  await q;
}

export function cookieHeader(name: string, value: string, maxAgeS: number, secure: boolean, strict = false) {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=${strict ? 'Strict' : 'Lax'}; Max-Age=${maxAgeS}${secure ? '; Secure' : ''}`;
}
export function parseCookies(h: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (h ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

// ---------- Brute-force protection ----------
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IDENTIFIER = 5;
const MAX_PER_IP = 20;

export async function isThrottled(scope: string, identifier: string, ip: string, maxId = MAX_PER_IDENTIFIER, maxIp = MAX_PER_IP): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { data: byId } = await db().from('login_attempts').select('success, created_at')
    .eq('scope', scope).eq('identifier', identifier).gte('created_at', since).order('created_at', { ascending: false }).limit(maxId);
  let fails = 0;
  for (const r of byId ?? []) { if (r.success) break; fails++; }
  if (fails >= maxId) return true;
  const { count } = await db().from('login_attempts').select('id', { count: 'exact', head: true })
    .eq('scope', scope).eq('ip', ip).eq('success', false).gte('created_at', since);
  return (count ?? 0) >= maxIp;
}
export async function recordAttempt(scope: string, identifier: string, ip: string, success: boolean) {
  await db().from('login_attempts').insert({ scope, identifier, ip, success });
}
