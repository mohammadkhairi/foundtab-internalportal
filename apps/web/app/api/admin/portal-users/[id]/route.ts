import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { adminFetch } from '@/lib/adminApi'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const callerRole = (session.user as { role?: string } | undefined)?.role ?? 'ADMIN'
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    if (action !== 'active' && action !== 'role') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    const body = await req.json() as unknown
    const data = await adminFetch(`/api/admin/portal-users/${id}/${action}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: { 'x-caller-role': callerRole },
    })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed'
    return NextResponse.json({ error: 'Failed', message }, { status: 500 })
  }
}
