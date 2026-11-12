import * as backend from '../services/backendApiService'
import * as auditRepo from '../repositories/auditLogRepository'

export async function listPlans() {
  return backend.listPlans()
}

export async function updateModuleAccess({
  planId,
  moduleKey,
  enabled,
  actorId,
}: {
  planId: string
  moduleKey: string
  enabled: boolean
  actorId: string | null
}) {
  const result = await backend.updatePlanModuleAccess({ planId, moduleKey, enabled })
  await auditRepo.log({
    userId: actorId,
    action: enabled ? 'ENABLE_MODULE' : 'DISABLE_MODULE',
    resourceType: 'plan',
    resourceId: planId,
    metadata: { moduleKey, enabled },
  })
  return result
}
