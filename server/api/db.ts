import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Server-only client. The service-role key never reaches the browser bundle (no VITE_ prefix).
let client: SupabaseClient | null = null;
export function db(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured');
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}

// PostgREST caps responses at 1000 rows; page through everything.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAll<T = any>(table: string, columns: string, apply?: (q: any) => any): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    let q = db().from(table).select(columns);
    if (apply) q = apply(q);
    const { data, error } = await q.range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...(data as unknown as T[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}

export function check<T>(r: { data: T; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}
