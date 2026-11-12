import * as globalFlagsRepo from '../repositories/globalFlagsRepository'
import * as backend from '../services/backendApiService'
import * as auditRepo from '../repositories/auditLogRepository'
import type { FlagData } from '../repositories/globalFlagsRepository'

export async function getGlobalFlags() {
  return globalFlagsRepo.getFlags()
}

export async function updateGlobalFlags({
  flags,
  actorId,
}: {
  flags: unknown
  actorId: string | null
}) {
  const before = await globalFlagsRepo.getFlags()
  const data = flags as FlagData

  // Persist to portal DB (fallback source of truth)
  await globalFlagsRepo.upsertFlags(data)

  // Update backend Redis cache so changes take effect immediately
  await backend.updateGlobalFlags({ flags: data })

  await auditRepo.log({
    userId: actorId,
    action: 'UPDATE_GLOBAL_FLAGS',
    resourceType: 'feature_flag',
    metadata: { before, after: flags },
  })

  return data
}
