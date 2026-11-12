import { pgTable, serial, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const globalFeatureFlags = pgTable('global_feature_flags', {
  id: serial('id').primaryKey(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
