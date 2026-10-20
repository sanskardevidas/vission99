// Backend-only Admin provisioning:
//   ADMIN_EMAIL=... ADMIN_INITIAL_PASSWORD=... node --experimental-strip-types server/scripts/provision-admin.ts
// Creates the Super Admin (or resets it, if it already exists) with a hashed password and
// must_change_password = true. Never prints or stores the password.
import { db } from '../api/db.ts';
import { hashPassword } from '../api/security.ts';
import { audit } from '../api/audit.ts';

try { process.loadEnvFile('.env.local'); } catch { /* env provided by the shell */ }
const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
const password = process.env.ADMIN_INITIAL_PASSWORD ?? '';
if (!email || !password) { console.error('ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD are required.'); process.exit(1); }

const { data: existing } = await db().from('admin_users').select('id').eq('email', email).maybeSingle();
const fields = { password_hash: await hashPassword(password), must_change_password: true, is_active: true, role: 'super_admin' };
const res = existing
  ? await db().from('admin_users').update(fields).eq('id', existing.id).select('id').single()
  : await db().from('admin_users').insert({ email, full_name: 'VISSION99 Administrator', ...fields }).select('id').single();
if (res.error) { console.error('Provisioning failed:', res.error.message); process.exit(1); }
await audit({ actorType: 'system', action: existing ? 'admin.reprovisioned' : 'admin.provisioned', entityType: 'admin', entityId: res.data.id });
console.log(`${existing ? 'Updated' : 'Created'} Super Admin account for ${email} (password change required on first login).`);
