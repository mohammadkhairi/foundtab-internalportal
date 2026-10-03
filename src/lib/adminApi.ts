import { env } from '../config/env'

export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'AdminApiError'
  }
}

type AdminFetchOptions = RequestInit

export async function adminFetch<T>(path: string, options: AdminFetchOptions = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-admin-api-key': env.FOUNDTAB_ADMIN_API_KEY,
    ...options.headers,
  }

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, { ...options, headers })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string }
    throw new AdminApiError(response.status, body.error ?? 'UNKNOWN', body.message ?? 'Request failed')
  }

  return response.json() as Promise<T>
}
