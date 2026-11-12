import { pgTable, text, boolean, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core'

const PORTAL_ROLES = ['ADMIN', 'SUPERADMIN'] as const
export const portalRoleEnum = pgEnum('portal_role', PORTAL_ROLES)
export const PortalRole = { ADMIN: 'ADMIN', SUPERADMIN: 'SUPERADMIN' } as const
export type PortalRole = (typeof PORTAL_ROLES)[number]

export const portalUsers = pgTable('portal_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: portalRoleEnum('role').notNull().default('ADMIN'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type PortalUser = typeof portalUsers.$inferSelect
export type NewPortalUser = typeof portalUsers.$inferInsert
