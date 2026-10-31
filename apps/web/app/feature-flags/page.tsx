'use client'

import { useEffect, useState } from 'react'

type ModuleKey =
  | 'purchases' | 'rawMaterials' | 'products' | 'recipes' | 'orders' | 'productions' | 'dashboard'
  | 'fixedCosts' | 'assetPurchases' | 'staffPayroll' | 'miscExpenses'
  | 'customerDatabase' | 'wastageReport' | 'productPerformance'
  | 'humanResource' | 'menuEngineering' | 'documentation'
  | 'accounting' | 'cashFlow' | 'morningReport'

type FeatureFlags = Record<ModuleKey, boolean>

type ModuleMeta = { key: ModuleKey; label: string; tier: 'starter' | 'growth' | 'advance' | 'pro' }

const MODULES: ModuleMeta[] = [
  { key: 'dashboard',          label: 'Summary Dashboard',     tier: 'starter' },
  { key: 'purchases',          label: 'Purchases',             tier: 'starter' },
  { key: 'rawMaterials',       label: 'Raw Materials',         tier: 'starter' },
  { key: 'products',           label: 'Products / SKU',        tier: 'starter' },
  { key: 'recipes',            label: 'Recipes / Costing',     tier: 'starter' },
  { key: 'orders',             label: 'Orders / Sales',        tier: 'starter' },
  { key: 'productions',        label: 'Productions',           tier: 'starter' },
  { key: 'fixedCosts',         label: 'Fixed Costs',           tier: 'growth' },
  { key: 'assetPurchases',     label: 'Asset Purchases',       tier: 'growth' },
  { key: 'staffPayroll',       label: 'Staff & Payroll',       tier: 'growth' },
  { key: 'miscExpenses',       label: 'Misc Expenses',         tier: 'growth' },
  { key: 'customerDatabase',   label: 'Customer Database',     tier: 'growth' },
  { key: 'wastageReport',      label: 'Wastage Report',        tier: 'growth' },
  { key: 'productPerformance', label: 'Product Performance',   tier: 'growth' },
  { key: 'humanResource',      label: 'Human Resource',        tier: 'advance' },
  { key: 'menuEngineering',    label: 'Menu Engineering',      tier: 'advance' },
  { key: 'documentation',      label: 'Documentation',         tier: 'advance' },
  { key: 'accounting',         label: 'Accounting',            tier: 'pro' },
  { key: 'cashFlow',           label: 'Cash Flow Management',  tier: 'pro' },
  { key: 'morningReport',      label: 'Morning Report',        tier: 'pro' },
]

const TIER_LABELS: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  advance: 'Advance',
  pro: 'Pro',
}

const TIER_COLORS: Record<string, string> = {
  starter: 'bg-brand-100 text-brand-700',
  growth: 'bg-emerald-100 text-emerald-700',
  advance: 'bg-violet-100 text-violet-700',
  pro: 'bg-amber-100 text-amber-700',
}

const TIERS = ['starter', 'growth', 'advance', 'pro'] as const

const DEFAULTS: FeatureFlags = {
  purchases: true, rawMaterials: true, products: true, recipes: true,
  orders: true, productions: true, dashboard: true,
  fixedCosts: false, assetPurchases: false, staffPayroll: false, miscExpenses: false,
  customerDatabase: false, wastageReport: false, productPerformance: false,
  humanResource: false, menuEngineering: false, documentation: false,
  accounting: false, cashFlow: false, morningReport: false,
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/feature-flags')
      .then((r) => r.json() as Promise<FeatureFlags>)
      .then((f) => setFlags(f))
      .catch(() => setError('Failed to load flags.'))
      .finally(() => setLoading(false))
  }, [])

  function toggle(key: ModuleKey) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await fetch('/api/admin/feature-flags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flags),
      })
      setSaved(true)
    } catch {
      setError('Save failed. Check admin key and backend.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-gray-500 p-6">Loading...</p>

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Toggle modules on/off globally. Changes take effect immediately — no deploy needed.
        </p>
      </div>

      {TIERS.map((tier) => {
        const modules = MODULES.filter((m) => m.tier === tier)
        return (
          <section key={tier}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_COLORS[tier]}`}>
                {TIER_LABELS[tier]}
              </span>
              <span className="text-xs text-gray-400">
                {modules.filter((m) => flags[m.key]).length}/{modules.length} enabled
              </span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {modules.map((mod) => (
                <div key={mod.key} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">{mod.label}</span>
                  <button
                    role="switch"
                    aria-checked={flags[mod.key]}
                    onClick={() => toggle(mod.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      flags[mod.key] ? 'bg-brand-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                        flags[mod.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="bg-brand-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-brand-600 transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save flags'}
        </button>
        {saved && <p className="text-sm text-emerald-600 font-medium">Saved.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
