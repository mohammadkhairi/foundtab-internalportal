import { adminFetch } from '@/lib/adminApi'
import Link from 'next/link'
import PlanControl from './PlanControl'
import StatusControl from './StatusControl'
import EditInfoSection from './EditInfoSection'
import OrgUserActions from './OrgUserActions'
import AddMemberButton from './AddMemberButton'
import InvoiceSection from './InvoiceSection'

type Org = {
  id: string
  clerkOrgId: string
  name: string
  slug: string
  plan: string
  status: string
  billingCycle: 'MONTHLY' | 'YEARLY' | null
  industry: string | null
  subIndustry: string | null
  registrationNumber: string | null
  address: string | null
  contactNumber: string | null
  contactEmail: string | null
  website: string | null
  trialEndsAt: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type OrgUser = {
  id: string
  orgId: string | null
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  createdAt: string
}

type AuditEntry = {
  id: string
  orgId: string
  clerkUserId: string
  action: string
  entityType: string
  entityId: string | null
  before: unknown
  after: unknown
  ipAddress: string | null
  createdAt: string
}

type Invoice = {
  id: string
  invoiceNumber: string
  amount: string
  currency: string
  status: 'PENDING' | 'PAID' | 'VOID'
  description: string | null
  dueDate: string | null
  paidAt: string | null
  createdAt: string
}

type PageData = {
  org: Org
  orgUsers: OrgUser[]
  auditLog: AuditEntry[]
}

function InfoRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] truncate">{value ?? '—'}</span>
    </div>
  )
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

const ROLE_COLORS: Record<string, string> = {
  OWNER:  'bg-violet-100 text-violet-700',
  ADMIN:  'bg-brand-100 text-brand-700',
  MEMBER: 'bg-gray-100 text-gray-600',
}

export default async function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [data, invoices] = await Promise.all([
    adminFetch<PageData>(`/api/admin/orgs/${id}`),
    adminFetch<Invoice[]>(`/api/admin/orgs/${id}/invoices`).catch(() => [] as Invoice[]),
  ])
  const { org, orgUsers, auditLog } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/orgs" className="text-sm text-brand-600 hover:text-brand-800">&larr; Organisations</Link>
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
        <Link
          href={`/orgs/${org.id}/feature-overrides`}
          className="text-sm font-medium text-brand-600 hover:text-brand-800 border border-brand-200 rounded-lg px-3 py-1.5 hover:bg-brand-50 transition-colors"
        >
          Feature overrides →
        </Link>
      </div>

      {/* Plan & Status controls */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PlanControl orgId={org.id} currentPlan={org.plan} currentTrialEndsAt={org.trialEndsAt} />
        <StatusControl orgId={org.id} currentStatus={org.status} />
      </div>

      {/* Org info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Organisation info</h2>
        <InfoRow label="ID" value={org.id} />
        <InfoRow label="Clerk ID" value={org.clerkOrgId} />
        <InfoRow label="Slug" value={org.slug} />
        <InfoRow label="Billing cycle" value={org.billingCycle} />
        <InfoRow label="Industry" value={org.industry} />
        <InfoRow label="Sub-industry" value={org.subIndustry} />
        <InfoRow label="Reg. number" value={org.registrationNumber} />
        <InfoRow label="Address" value={org.address} />
        <InfoRow label="Contact number" value={org.contactNumber} />
        <InfoRow label="Contact email" value={org.contactEmail} />
        <InfoRow label="Website" value={org.website} />
        <InfoRow label="Created" value={new Date(org.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })} />
        {org.trialEndsAt && (
          <InfoRow label="Trial ends" value={new Date(org.trialEndsAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })} />
        )}
        {org.deletedAt && (
          <InfoRow label="Deleted at" value={new Date(org.deletedAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })} />
        )}
      </div>

      {/* Edit contact info */}
      <EditInfoSection
        orgId={org.id}
        org={{
          name: org.name,
          billingCycle: org.billingCycle,
          address: org.address,
          contactNumber: org.contactNumber,
          contactEmail: org.contactEmail,
          website: org.website,
          registrationNumber: org.registrationNumber,
          industry: org.industry,
        }}
      />

      {/* Members */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Members ({orgUsers.length})
          </h2>
          <AddMemberButton orgId={org.id} />
        </div>
        {orgUsers.length === 0 ? (
          <p className="text-sm text-gray-400 px-4 py-6 text-center">No members yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {orgUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-gray-900 text-sm">
                    {u.firstName || u.lastName ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <OrgUserActions orgId={org.id} userId={u.id} currentRole={u.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invoices */}
      <InvoiceSection orgId={org.id} initialInvoices={invoices} />

      {/* Audit log */}
      {auditLog.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent activity</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {auditLog.map((entry) => (
              <div key={entry.id} className="px-4 py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {entry.entityType}{entry.entityId ? ` · ${entry.entityId}` : ''}
                    {entry.clerkUserId ? ` · by ${entry.clerkUserId}` : ''}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(entry.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
