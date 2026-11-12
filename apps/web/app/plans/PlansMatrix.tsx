'use client'

import { useState } from 'react'

type PlanModule = {
  id: string
  planId: string
  moduleKey: string
  enabled: boolean
}

type Plan = {
  id: string
  key: string
  label: string
  tierOrder: number
  description: string
  modules: PlanModule[]
}

const MODULE_LABELS: Record<string, string> = {
  dashboard:          'Summary Dashboard',
  purchases:          'Purchases',
  rawMaterials:       'Raw Materials',
  products:           'Products / SKU',
  recipes:            'Recipes / Costing',
  orders:             'Orders / Sales',
  productions:        'Productions',
  fixedCosts:         'Fixed Costs',
  assetPurchases:     'Asset Purchases',
  staffPayroll:       'Staff & Payroll',
  miscExpenses:       'Misc Expenses',
  customerDatabase:   'Customer Database',
  wastageReport:      'Wastage Report',
  productPerformance: 'Product Performance',
  humanResource:      'Human Resource',
  menuEngineering:    'Menu Engineering',
  documentation:      'Documentation',
  accounting:         'Accounting',
  cashFlow:           'Cash Flow Management',
  morningReport:      'Morning Report',
}

const MODULE_KEYS = Object.keys(MODULE_LABELS)

const PLAN_COLORS: Record<string, string> = {
  TRIAL:   'text-gray-600',
  STARTER: 'text-brand-700',
  GROWTH:  'text-emerald-700',
  ADVANCE: 'text-violet-700',
  PRO:     'text-amber-700',
}

export default function PlansMatrix({ initialPlans }: { initialPlans: Plan[] }) {
  const [plans, setPlans] = useState(initialPlans)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function isEnabled(plan: Plan, moduleKey: string): boolean {
    return plan.modules.find((m) => m.moduleKey === moduleKey)?.enabled ?? false
  }

  async function toggle(plan: Plan, moduleKey: string) {
    const currentEnabled = isEnabled(plan, moduleKey)
    const newEnabled = !currentEnabled
    const key = `${plan.id}:${moduleKey}`
    setSaving(key)
    setError(null)

    setPlans((prev) =>
      prev.map((p) =>
        p.id !== plan.id
          ? p
          : {
              ...p,
              modules: p.modules.map((m) =>
                m.moduleKey === moduleKey ? { ...m, enabled: newEnabled } : m,
              ),
            },
      ),
    )

    try {
      const res = await fetch('/api/admin/plans/module-access', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, moduleKey, enabled: newEnabled }),
      })
      if (!res.ok) throw new Error('Failed')
    } catch {
      setError(`Failed to update ${plan.label} / ${moduleKey}`)
      setPlans((prev) =>
        prev.map((p) =>
          p.id !== plan.id
            ? p
            : {
                ...p,
                modules: p.modules.map((m) =>
                  m.moduleKey === moduleKey ? { ...m, enabled: currentEnabled } : m,
                ),
              },
        ),
      )
    } finally {
      setSaving(null)
    }
  }

  const sortedPlans = [...plans].sort((a, b) => a.tierOrder - b.tierOrder)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Which modules are included in each plan. Changes apply to all new and existing subscribers on that plan.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[180px]">
                Module
              </th>
              {sortedPlans.map((plan) => (
                <th key={plan.id} className="px-4 py-3 text-center min-w-[90px]">
                  <div className={`text-xs font-bold uppercase tracking-wide ${PLAN_COLORS[plan.key] ?? 'text-gray-700'}`}>
                    {plan.label}
                  </div>
                  <div className="text-xs text-gray-400 font-normal mt-0.5 normal-case tracking-normal">
                    {plan.modules.filter((m) => m.enabled).length} modules
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULE_KEYS.map((moduleKey) => (
              <tr key={moduleKey} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {MODULE_LABELS[moduleKey]}
                </td>
                {sortedPlans.map((plan) => {
                  const enabled = isEnabled(plan, moduleKey)
                  const isSaving = saving === `${plan.id}:${moduleKey}`
                  return (
                    <td key={plan.id} className="px-4 py-3 text-center">
                      <button
                        onClick={() => void toggle(plan, moduleKey)}
                        disabled={isSaving}
                        className={`w-6 h-6 rounded-full border-2 transition-colors flex items-center justify-center mx-auto ${
                          isSaving
                            ? 'border-gray-300 bg-gray-100'
                            : enabled
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                        aria-label={enabled ? 'Disable' : 'Enable'}
                      >
                        {enabled && !isSaving && (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {isSaving && (
                          <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
