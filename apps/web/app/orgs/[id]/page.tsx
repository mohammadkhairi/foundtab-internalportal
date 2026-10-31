import { adminFetch } from '../../../src/lib/adminApi'
import Link from 'next/link'
import PlanControl from './PlanControl'

type OrgDetail = {
  id: string
  name: string
  plan: string
  status: string
  industry: string | null
  registrationNumber: string | null
  memberCount: number
  rawMaterialCount: number
  productCount: number
  orderCount: number
  totalRevenue: number
  createdAt: string
  trialEndsAt: string | null
  featureOverrides: Record<string, boolean>
}

function InfoRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value ?? '—'}</span>
    </div>
  )
}

const PLAN_COLORS: Record<string, string> = {
  TRIAL:   'bg-gray-100 text-gray-600',
  STARTER: 'bg-sky-100 text-sky-700',
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

export default async function OrgDetailPage({ params }: { params: { id: string } }) {
  const data = await adminFetch<{ org: OrgDetail }>(`/admin/orgs/${params.id}`)
  const org = data.org

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/orgs" className="text-sm text-sky-600 hover:text-sky-800">&larr; Organisations</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{org.name}</h1>
          <div className="flex gap-2 mt-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[org.plan] ?? 'bg-gray-100 text-gray-600'}`}>
              {org.plan}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[org.status] ?? 'bg-gray-100 text-gray-500'}`}>
              {org.status}
            </span>
          </div>
        </div>
      </div>

      {/* Subscription control */}
      <PlanControl orgId={org.id} currentPlan={org.plan} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Organisation info</h2>
          <InfoRow label="ID" value={org.id} />
          <InfoRow label="Industry" value={org.industry} />
          <InfoRow label="Reg. number" value={org.registrationNumber} />
          <InfoRow label="Created" value={new Date(org.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })} />
          {org.trialEndsAt && (
            <InfoRow label="Trial ends" value={new Date(org.trialEndsAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })} />
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Usage stats</h2>
          <InfoRow label="Members" value={org.memberCount} />
          <InfoRow label="Raw materials" value={org.rawMaterialCount} />
          <InfoRow label="Products" value={org.productCount} />
          <InfoRow label="Orders" value={org.orderCount} />
          <InfoRow label="Total revenue" value={`RM ${org.totalRevenue.toFixed(2)}`} />
        </div>
      </div>
    </div>
  )
}
