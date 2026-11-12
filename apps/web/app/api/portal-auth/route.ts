import { NextResponse } from 'next/server'

const PORTAL_API_URL = process.env.PORTAL_API_INTERNAL_URL ?? 'http://localhost:4000'

export async function GET() {
  try {
    const res = await fetch(`${PORTAL_API_URL}/api/auth/has-users`)
    const data = (await res.json()) as { hasUsers: boolean }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ hasUsers: false })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as unknown
    const res = await fetch(`${PORTAL_API_URL}/api/auth/setup`, {
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
