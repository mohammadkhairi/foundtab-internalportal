import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { adminFetch } from '@/lib/adminApi'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; invoiceId: string }> }) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, invoiceId } = await params
  try {
    const body = await req.json() as unknown
    const data = await adminFetch(`/api/admin/orgs/${id}/invoices/${invoiceId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
