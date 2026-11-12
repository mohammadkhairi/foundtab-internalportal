import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { env } from '@/config/env'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; invoiceId: string }> },
) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, invoiceId } = await params
  const res = await fetch(
    `${env.PORTAL_API_URL}/api/admin/orgs/${id}/invoices/${invoiceId}/pdf`,
    { headers: { 'x-admin-key': env.FOUNDTAB_ADMIN_API_KEY } },
  )

  if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status })

  const pdf = await res.arrayBuffer()
  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': res.headers.get('Content-Disposition') ?? 'inline',
    },
  })
}
