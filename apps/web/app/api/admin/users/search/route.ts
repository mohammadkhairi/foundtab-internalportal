import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { adminFetch } from '@/lib/adminApi'

type ClerkUser = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  imageUrl: string
}

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') ?? ''
    const data = await adminFetch<ClerkUser[]>(`/api/admin/users/search?q=${encodeURIComponent(q)}`)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed'
    return NextResponse.json({ error: 'Failed', message }, { status: 500 })
  }
}
