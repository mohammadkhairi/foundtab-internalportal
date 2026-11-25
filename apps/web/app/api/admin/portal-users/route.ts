import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { adminFetch } from '@/lib/adminApi'

export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const data = await adminFetch('/api/admin/portal-users')
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json() as unknown
    const data = await adminFetch('/api/admin/portal-users', { method: 'POST', body: JSON.stringify(body) })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed'
    return NextResponse.json({ error: 'Failed', message }, { status: 500 })
  }
}
