'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = ['ACTIVE', 'TRIAL', 'SUSPENDED', 'DELETED'] as const
type Status = typeof STATUSES[number]

const STATUS_COLORS: Record<Status, string> = {
  ACTIVE:    'bg-green-100 text-green-700',
  TRIAL:     'bg-amber-100 text-amber-700',
  SUSPENDED: 'bg-red-100 text-red-600',
  DELETED:   'bg-gray-100 text-gray-500',
}

export default function StatusControl({ orgId, currentStatus }: { orgId: string; currentStatus: string }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Status>(currentStatus as Status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const hasChanged = selected !== currentStatus

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selected }),
      })
      if (!res.ok) throw new Error('Failed')
      setSaved(true)
      router.refresh()
    } catch {
      setError('Failed to update status.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Account status</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => { setSelected(status); setSaved(false) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              selected === status
                ? `${STATUS_COLORS[status]} border-transparent ring-2 ring-offset-1 ring-current`
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => void handleSave()}
          disabled={saving || !hasChanged}
          className="bg-brand-500 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-brand-600 transition-colors disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Save status'}
        </button>
        {saved && <p className="text-sm text-emerald-600 font-medium">Status updated.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
