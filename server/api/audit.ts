import { db } from './db.ts';

export async function audit(a: {
  actorType: 'admin' | 'partner' | 'system'; actorId?: string; actorLabel?: string;
  action: string; entityType: string; entityId?: string; before?: unknown; after?: unknown; reason?: string;
}) {
  await db().from('audit_logs').insert({
    actor_type: a.actorType, actor_id: a.actorId ?? null, actor_label: a.actorLabel ?? null,
    action: a.action, entity_type: a.entityType, entity_id: a.entityId ?? null,
    before_value: a.before ?? null, after_value: a.after ?? null, reason: a.reason ?? null,
  });
}
