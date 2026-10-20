// Vercel serverless entry. vercel.json rewrites every /api/* request to this function with the original
// path in the `__path` query parameter; it is restored here so the shared router sees the real URL.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { apiHandler } from './api/index.ts';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const u = new URL(req.url ?? '/', 'http://local');
  const p = u.searchParams.get('__path');
  if (p !== null) {
    u.searchParams.delete('__path');
    if (u.searchParams.get('path') === p) u.searchParams.delete('path'); // duplicate injected by the platform rewrite
    req.url = `/api/${p.replace(/^\/+/, '')}${u.search}`;
  }
  return apiHandler(req, res, () => { res.statusCode = 404; res.end(); });
}
