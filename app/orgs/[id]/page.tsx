import { adminFetch } from '../../../src/lib/adminApi'
import Link from 'next/link'

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

export default async function OrgDetailPage({ params }: { params: { id: string } }) {
  const org = await adminFetch<OrgDetail>(`/api/admin/orgs/${params.id}`)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/orgs" className="text-sm text-sky-600 hover:text-sky-800">&larr; Organisations</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{org.name}</h1>
          <div className="flex gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
              org.plan === 'business' ? 'bg-purple-100 text-purple-700' :
              org.plan === 'pro' ? 'bg-sky-100 text-sky-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {org.plan}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
              org.status === 'active' ? 'bg-green-100 text-green-700' :
              org.status === 'trial' ? 'bg-amber-100 text-amber-700' :
              org.status === 'suspended' ? 'bg-red-100 text-red-600' :
              'bg-gray-100 text-gray-500'
            }`}>
              {org.status}
            </span>
          </div>
        </div>
        <Link
          href={`/orgs/${org.id}/feature-overrides`}
          className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          Feature Overrides
        </Link>
      </div>

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

      {Object.keys(org.featureOverrides).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Active feature overrides</h2>
          <div className="space-y-2">
            {Object.entries(org.featureOverrides).map(([feature, enabled]) => (
              <div key={feature} className="flex justify-between py-1">
                <span className="text-sm text-gray-700 font-mono">{feature}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {enabled ? 'enabled' : 'disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
