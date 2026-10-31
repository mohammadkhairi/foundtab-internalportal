import { adminFetch } from '../../src/lib/adminApi'

type PlatformStats = {
  totalOrgs: number
  activeOrgs: number
  trialOrgs: number
  suspendedOrgs: number
  totalMembers: number
  totalRevenue: number
  planBreakdown: Record<string, number>
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

export default async function SettingsPage() {
  const stats = await adminFetch<PlatformStats>('/api/admin/stats')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total orgs" value={stats.totalOrgs} />
        <StatCard label="Active" value={stats.activeOrgs} />
        <StatCard label="On trial" value={stats.trialOrgs} />
        <StatCard label="Suspended" value={stats.suspendedOrgs} />
        <StatCard label="Total members" value={stats.totalMembers} />
        <StatCard label="Total revenue" value={`RM ${stats.totalRevenue.toFixed(2)}`} />
      </div>

      {Object.keys(stats.planBreakdown).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Plan breakdown</h2>
          <div className="space-y-2">
            {Object.entries(stats.planBreakdown).map(([plan, count]) => (
              <div key={plan} className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-700 capitalize">{plan}</span>
                <span className="text-sm font-semibold text-gray-900">{count} orgs</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Maintenance jobs</h2>
        <RunJobButton jobId="cleanup-drafts" label="Clean up abandoned drafts" description="Remove draft orders older than 24 hours." />
        <RunJobButton jobId="send-stock-alerts" label="Send stock alerts" description="Trigger stock alert check and push notifications." />
      </div>
    </div>
  )
}

function RunJobButton({ jobId, label, description }: { jobId: string; label: string; description: string }) {
  return (
    <form
      action={async () => {
        'use server'
        await adminFetch(`/api/admin/jobs/${jobId}`, { method: 'POST' })
      }}
      className="flex items-start justify-between gap-4 py-2"
    >
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="submit"
        className="flex-shrink-0 text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Run
      </button>
    </form>
  )
}
