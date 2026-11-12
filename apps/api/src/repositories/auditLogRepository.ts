import { desc, eq } from 'drizzle-orm'
import { db } from '../db/index'
import { portalAuditLogs } from '../db/schema/index'

type CreateAuditLog = {
  userId: string | null
  action: string
  resourceType: string
  resourceId?: string | null
  metadata?: Record<string, unknown> | null
}

export async function log({ userId, action, resourceType, resourceId, metadata }: CreateAuditLog) {
  await db().insert(portalAuditLogs).values({
    userId,
    action,
    resourceType,
    resourceId: resourceId ?? null,
    metadata: metadata ?? null,
  })
}

export async function listLogs({ limit = 100 }: { limit?: number } = {}) {
  return db().query.portalAuditLogs.findMany({
    orderBy: [desc(portalAuditLogs.createdAt)],
    limit,
    with: { userId: true },
  })
}

export async function listLogsByResource({
  resourceType,
  resourceId,
}: {
  resourceType: string
  resourceId: string
}) {
  return db().query.portalAuditLogs.findMany({
    where: (t, { and }) => and(eq(t.resourceType, resourceType), eq(t.resourceId, resourceId)),
    orderBy: [desc(portalAuditLogs.createdAt)],
  })
}
