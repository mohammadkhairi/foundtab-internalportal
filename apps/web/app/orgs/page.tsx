import { adminFetch } from '../../src/lib/adminApi'
import Link from 'next/link'

type Org = {
  id: string
  name: string
  plan: string
  status: string
  memberCount: number
  createdAt: string
}

type ListResponse = {
  items: Org[]
  total: number
  page: number
  pageSize: number
}

const PLAN_COLORS: Record<string, string> = {
  TRIAL:   'bg-gray-100 text-gray-600',
  STARTER: 'bg-brand-100 text-brand-700',
  GROWTH:  'bg-emerald-100 text-emerald-700',
  ADVANCE: 'bg-violet-100 text-violet-700',
  PRO:     'bg-amber-100 text-amber-700',
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    'bg-green-100 text-green-700',
  TRIAL:     'bg-amber-100 text-amber-700',
  SUSPENDED: 'bg-red-100 text-red-600',
  DELETED:   'bg-gray-100 text-gray-500',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

type PageProps = {
  searchParams: { page?: string; search?: string }
}

export default async function OrgsPage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams.page ?? 1))
  const search = searchParams.search ?? ''

  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set('search', search)

  const data = await adminFetch<ListResponse>(`/admin/orgs?${params.toString()}`)
  const totalPages = Math.ceil(data.total / data.pageSize)
  const start = (data.page - 1) * data.pageSize + 1
  const end = Math.min(data.page * data.pageSize, data.total)

  function pageUrl(p: number) {
    const sp = new URLSearchParams({ page: String(p) })
    if (search) sp.set('search', search)
    return `/orgs?${sp.toString()}`
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data.total} total</p>
        </div>
        <form method="GET" action="/orgs" className="flex gap-2">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search name…"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <button
            type="submit"
            className="bg-brand-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-600 transition-colors"
          >
            Search
          </button>
          {search && (
            <Link href="/orgs" className="text-sm text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              Clear
            </Link>
          )}
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Members</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {data.items.map((org) => (
              <tr key={org.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{org.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLAN_COLORS[org.plan] ?? 'bg-gray-100 text-gray-600'}`}>
                    {org.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[org.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {org.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{org.memberCount}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(org.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/orgs/${org.id}`} className="text-xs text-brand-600 font-medium hover:text-brand-800">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.items.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">{search ? `No organisations matching "${search}".` : 'No organisations yet.'}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-gray-400">
            {start}–{end} of {data.total}
          </p>
          <div className="flex items-center gap-1">
            <Link
              href={pageUrl(page - 1)}
              aria-disabled={page <= 1}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm ${
                page <= 1 ? 'pointer-events-none opacity-40 text-gray-400' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              ‹
            </Link>
            <span className="text-xs text-gray-500 px-2">{page} / {totalPages}</span>
            <Link
              href={pageUrl(page + 1)}
              aria-disabled={page >= totalPages}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm ${
                page >= totalPages ? 'pointer-events-none opacity-40 text-gray-400' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              ›
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
