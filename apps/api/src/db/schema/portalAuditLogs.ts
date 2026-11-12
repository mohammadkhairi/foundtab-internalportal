import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core'
import { portalUsers } from './portalUsers'

export const portalAuditLogs = pgTable('portal_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => portalUsers.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // e.g. UPDATE_PLAN, ENABLE_MODULE, DISABLE_MODULE
  resourceType: text('resource_type').notNull(), // e.g. org, plan, feature_flag
  resourceId: text('resource_id'),
  metadata: jsonb('metadata'), // { before, after, notes }
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type PortalAuditLog = typeof portalAuditLogs.$inferSelect
