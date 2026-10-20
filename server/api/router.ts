import type { IncomingMessage, ServerResponse } from 'node:http';
import { COOKIE, parseCookies, resolveSession } from './security.ts';
import { db } from './db.ts';

export interface Partner { id: string; full_name: string; mobile: string; role: 'CP' | 'PP' | 'MG'; referred_by: string | null; status: string; kyc_status: string; kyc_details: unknown; joined_at: string }
export interface Admin { id: string; email: string; full_name: string; role: 'super_admin' | 'admin' | 'finance'; must_change_password: boolean; is_active: boolean }
export interface Ctx {
  ip: string; secure: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any; query: URLSearchParams; params: Record<string, string>;
  tokens: { partner?: string; admin?: string };
  partner?: Partner; admin?: Admin;
}
export interface Res { status: number; body: unknown; cookies?: string[] }
type Handler = (c: Ctx) => Promise<Res>;
interface Route { method: string; re: RegExp; keys: string[]; auth: 'none' | 'partner' | 'admin'; roles?: Admin['role'][]; allowMustChange?: boolean; handler: Handler }

const routes: Route[] = [];
export function route(method: string, path: string, auth: Route['auth'], handler: Handler, opts: { roles?: Admin['role'][]; allowMustChange?: boolean } = {}) {
  const keys: string[] = [];
  const re = new RegExp('^' + path.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
  routes.push({ method, re, keys, auth, handler, ...opts });
}
export const ok = (body: unknown = { ok: true }, cookies?: string[]): Res => ({ status: 200, body, cookies });
export const fail = (status: number, error: string, extra: object = {}): Res => ({ status, body: { error, ...extra } });

export const PARTNER_COLS = 'id, full_name, mobile, role, referred_by, status, kyc_status, kyc_details, joined_at';

async function authenticate(r: Route, c: Ctx): Promise<Res | null> {
  if (r.auth === 'partner') {
    const id = await resolveSession('partner', c.tokens.partner);
    const { data } = id ? await db().from('partners').select(PARTNER_COLS).eq('id', id).maybeSingle() : { data: null };
    if (!data || data.status !== 'Active') return fail(401, 'unauthenticated');
    c.partner = data as Partner;
  } else if (r.auth === 'admin') {
    // Admin routes accept ONLY an admin session; partner cookies are never consulted.
    const id = await resolveSession('admin', c.tokens.admin);
    const { data } = id ? await db().from('admin_users').select('id, email, full_name, role, must_change_password, is_active').eq('id', id).maybeSingle() : { data: null };
    if (!data || !data.is_active) return fail(401, 'unauthenticated');
    c.admin = data as Admin;
    if (data.must_change_password && !r.allowMustChange) return fail(403, 'password_change_required');
    if (r.roles && !r.roles.includes(data.role)) return fail(403, 'forbidden');
  }
  return null;
}

// Behind Vercel the socket peer is the platform proxy; the real client IP is in a header that Vercel
// sets itself (client-supplied values are overwritten). Locally, fall back to the socket address.
function clientIp(req: IncomingMessage): string {
  if (process.env.VERCEL) {
    const h = req.headers['x-vercel-forwarded-for'] ?? req.headers['x-forwarded-for'];
    const v = Array.isArray(h) ? h[0] : h;
    if (v) return v.split(',')[0].trim();
  }
  return req.socket.remoteAddress ?? 'unknown';
}

export async function apiHandler(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const [path, qs] = (req.url ?? '').split('?');
  if (!path.startsWith('/api/')) return next();
  const send = (r: Res) => {
    res.statusCode = r.status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    if (r.cookies?.length) res.setHeader('Set-Cookie', r.cookies);
    res.end(JSON.stringify(r.body));
  };
  const method = req.method ?? 'GET';
  try {
    // CSRF defence in depth (cookies are also SameSite): state-changing calls must be same-origin JSON.
    if (method !== 'GET') {
      const origin = req.headers.origin;
      if (origin && new URL(origin).host !== req.headers.host) return send(fail(403, 'forbidden'));
      if (!String(req.headers['content-type'] ?? '').startsWith('application/json')) return send(fail(415, 'unsupported'));
    }
    let body: unknown = {};
    const pre = (req as IncomingMessage & { body?: unknown }).body; // set by the Vercel runtime when it already parsed the JSON
    if (pre !== undefined && pre !== null && typeof pre === 'object') body = pre;
    else if (typeof pre === 'string') { try { body = pre ? JSON.parse(pre) : {}; } catch { return send(fail(400, 'bad_request')); } }
    else {
      let raw = '';
      await new Promise<void>((resolve, reject) => {
        req.on('data', (ch) => { raw += ch; if (raw.length > 64 * 1024) { req.destroy(); reject(new Error('too_large')); } });
        req.on('end', () => resolve());
        req.on('error', reject);
      });
      try { body = raw ? JSON.parse(raw) : {}; } catch { return send(fail(400, 'bad_request')); }
    }

    for (const r of routes) {
      if (r.method !== method) continue;
      const m = r.re.exec(path);
      if (!m) continue;
      const cookies = parseCookies(req.headers.cookie);
      const c: Ctx = {
        ip: clientIp(req),
        secure: req.headers['x-forwarded-proto'] === 'https',
        body, query: new URLSearchParams(qs ?? ''),
        params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])),
        tokens: { partner: cookies[COOKIE.partner], admin: cookies[COOKIE.admin] },
      };
      const denied = await authenticate(r, c);
      if (denied) return send(denied);
      return send(await r.handler(c));
    }
    send(fail(404, 'not_found'));
  } catch (e) {
    console.error('[api]', method, path, e instanceof Error ? e.message : 'error'); // never log bodies or secrets
    send(fail(500, 'server_error'));
  }
}
