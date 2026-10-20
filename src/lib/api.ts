// Thin client for the same-origin backend API. Sessions live in HttpOnly cookies set by the server.
export type ApiResult<T> = ({ ok: true } & T) | { ok: false; status: number; error: string; message: string };

export async function api<T = object>(method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const r = await fetch(path, {
      method, credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : method === 'GET' ? undefined : { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : method === 'GET' ? undefined : '{}',
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) return { ok: true, ...(j as T) };
    return { ok: false, status: r.status, error: j.error ?? 'error', message: j.message ?? 'Something went wrong. Please try again.' };
  } catch {
    return { ok: false, status: 0, error: 'network', message: 'Unable to reach the server. Please check your connection and try again.' };
  }
}
