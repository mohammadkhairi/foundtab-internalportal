import * as backend from '../services/backendApiService'
import * as auditRepo from '../repositories/auditLogRepository'

export async function listOrgs() {
  return backend.listOrgs()
}

export async function getOrg({ id }: { id: string }) {
  return backend.getOrg({ id })
}

export async function updateOrgPlan({
  id,
  plan,
  actorId,
}: {
  id: string
  plan: string
  actorId: string | null
}) {
  const before = await backend.getOrg({ id })
  const result = await backend.updateOrgPlan({ id, plan })
  await auditRepo.log({
    userId: actorId,
    action: 'UPDATE_PLAN',
    resourceType: 'org',
    resourceId: id,
    metadata: { before, after: { plan } },
  })
  return result
}

export async function getOrgFeatureOverrides({ id }: { id: string }) {
  return backend.getOrgFeatureOverrides({ id })
}

export async function updateOrgFeatureOverrides({
  id,
  overrides,
  actorId,
}: {
  id: string
  overrides: unknown
  actorId: string | null
}) {
  const before = await backend.getOrgFeatureOverrides({ id })
  const result = await backend.updateOrgFeatureOverrides({ id, overrides })
  await auditRepo.log({
    userId: actorId,
    action: 'UPDATE_FEATURE_OVERRIDES',
    resourceType: 'org',
    resourceId: id,
    metadata: { before, after: overrides },
  })
  return result
}
