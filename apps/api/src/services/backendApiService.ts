import { env } from '../config/env'

type BackendApiError = { type: 'BackendApiError'; status: number; message: string }

function makeBackendApiError(status: number, message: string): BackendApiError {
  return { type: 'BackendApiError', status, message }
}

export function isBackendApiError(err: unknown): err is BackendApiError {
  return typeof err === 'object' && err !== null && (err as BackendApiError).type === 'BackendApiError'
}

async function request<T>({
  method,
  path,
  body,
}: {
  method: string
  path: string
  body?: unknown
}): Promise<T> {
  const url = `${env.FOUNDTAB_API_URL}${path}`
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': env.FOUNDTAB_ADMIN_API_KEY,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  const data = (await res.json()) as T
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Backend error ${res.status}`
    throw makeBackendApiError(res.status, msg)
  }
  return data
}

export async function listOrgs() {
  return request<unknown>({ method: 'GET', path: '/api/admin/orgs' })
}

export async function getOrg({ id }: { id: string }) {
  return request<unknown>({ method: 'GET', path: `/api/admin/orgs/${id}` })
}

export async function updateOrgPlan({ id, plan }: { id: string; plan: string }) {
  return request<unknown>({ method: 'PATCH', path: `/api/admin/orgs/${id}/plan`, body: { plan } })
}

export async function getOrgFeatureOverrides({ id }: { id: string }) {
  return request<unknown>({ method: 'GET', path: `/api/admin/orgs/${id}/feature-overrides` })
}

export async function updateOrgFeatureOverrides({
  id,
  overrides,
}: {
  id: string
  overrides: unknown
}) {
  return request<unknown>({
    method: 'PUT',
    path: `/api/admin/orgs/${id}/feature-overrides`,
    body: overrides,
  })
}

export async function getGlobalFlags() {
  return request<unknown>({ method: 'GET', path: '/api/admin/feature-flags' })
}

export async function updateGlobalFlags({ flags }: { flags: unknown }) {
  return request<unknown>({ method: 'PUT', path: '/api/admin/feature-flags', body: flags })
}

export async function listPlans() {
  return request<unknown>({ method: 'GET', path: '/api/admin/plans' })
}

export async function updatePlanModuleAccess({
  planId,
  moduleKey,
  enabled,
}: {
  planId: string
  moduleKey: string
  enabled: boolean
}) {
  return request<unknown>({
    method: 'PATCH',
    path: '/api/admin/plans/module-access',
    body: { planId, moduleKey, enabled },
  })
}

export async function generateInvoice({ orgId }: { orgId: string }) {
  return request<unknown>({ method: 'POST', path: `/api/admin/orgs/${orgId}/invoices/generate` })
}

export async function getAdminStats() {
  return request<unknown>({ method: 'GET', path: '/api/admin/stats' })
}

export type { BackendApiError }
