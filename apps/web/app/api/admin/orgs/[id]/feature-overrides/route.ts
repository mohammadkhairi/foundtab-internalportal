import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { adminFetch } from '../../../../../../src/lib/adminApi'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json() as unknown
    const data = await adminFetch(`/api/admin/orgs/${id}/feature-overrides`, { method: 'PUT', body: JSON.stringify(body) })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
