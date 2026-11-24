import { NextResponse } from 'next/server'

function portalApiUrl() {
  return process.env.PORTAL_API_INTERNAL_URL ?? 'http://localhost:4000'
}

export async function GET() {
  try {
    const res = await fetch(`${portalApiUrl()}/api/auth/has-users`)
    if (!res.ok) {
      console.error('[portal-auth GET] portal API returned', res.status, portalApiUrl())
      return NextResponse.json({ hasUsers: true })
    }
    const data = (await res.json()) as { hasUsers: boolean }
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[portal-auth GET] failed to reach portal API:', portalApiUrl(), message)
    return NextResponse.json({ hasUsers: true })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as unknown
    const res = await fetch(`${portalApiUrl()}/api/auth/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = (await res.json()) as unknown
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed'
    return NextResponse.json({ error: 'Failed', message }, { status: 500 })
  }
}
