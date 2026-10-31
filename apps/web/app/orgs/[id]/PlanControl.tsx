'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLANS = ['TRIAL', 'STARTER', 'GROWTH', 'ADVANCE', 'PRO'] as const
type Plan = typeof PLANS[number]

const PLAN_LABELS: Record<Plan, string> = {
  TRIAL:   'Trial',
  STARTER: 'Starter',
  GROWTH:  'Growth',
  ADVANCE: 'Advance',
  PRO:     'Pro',
}

const PLAN_COLORS: Record<Plan, string> = {
  TRIAL:   'bg-gray-100 text-gray-600',
  STARTER: 'bg-brand-100 text-brand-700',
  GROWTH:  'bg-emerald-100 text-emerald-700',
  ADVANCE: 'bg-violet-100 text-violet-700',
  PRO:     'bg-amber-100 text-amber-700',
}

export default function PlanControl({ orgId, currentPlan }: { orgId: string; currentPlan: string }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Plan>(currentPlan as Plan)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const hasChanged = selected !== currentPlan

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await fetch(`/api/admin/orgs/${orgId}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
      })
      setSaved(true)
      router.refresh()
    } catch {
      setError('Failed to update plan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Subscription plan</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {PLANS.map((plan) => (
          <button
            key={plan}
            onClick={() => { setSelected(plan); setSaved(false) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              selected === plan
                ? `${PLAN_COLORS[plan]} border-transparent ring-2 ring-offset-1 ring-current`
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {PLAN_LABELS[plan]}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => void handleSave()}
          disabled={saving || !hasChanged}
          className="bg-brand-500 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-brand-600 transition-colors disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Save plan'}
        </button>
        {saved && <p className="text-sm text-emerald-600 font-medium">Plan updated.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
