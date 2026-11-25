import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { adminFetch } from '@/lib/adminApi'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action') // 'active' | 'role'
    const body = await req.json() as unknown
    const data = await adminFetch(`/api/admin/portal-users/${id}/${action}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed'
    return NextResponse.json({ error: 'Failed', message }, { status: 500 })
  }
}
