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
}

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-600',
  pro: 'bg-sky-100 text-sky-700',
  business: 'bg-purple-100 text-purple-700',
}

const STATUS_COLORS: Record<string, string> = {
  trial: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-600',
  cancelled: 'bg-gray-100 text-gray-500',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function OrgsPage() {
  const data = await adminFetch<ListResponse>('/api/admin/orgs?limit=100')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data.total} total</p>
        </div>
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
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${PLAN_COLORS[org.plan] ?? 'bg-gray-100 text-gray-600'}`}>
                    {org.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[org.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {org.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{org.memberCount}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(org.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/orgs/${org.id}`}
                    className="text-xs text-sky-600 font-medium hover:text-sky-800"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.items.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">No organisations yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
