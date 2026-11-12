import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { adminFetch } from '@/lib/adminApi'

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const data = await adminFetch(`/api/admin/orgs?${searchParams.toString()}`)
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
    const data = await adminFetch('/api/admin/orgs', { method: 'POST', body: JSON.stringify(body) })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
