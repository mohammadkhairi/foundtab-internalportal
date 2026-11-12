import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { adminFetch } from '@/lib/adminApi'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, userId } = await params
  try {
    const data = await adminFetch(`/api/admin/orgs/${id}/users/${userId}`, { method: 'DELETE' })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
