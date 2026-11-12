'use client'

import { useEffect, useState } from 'react'

type ModuleKey =
  | 'purchases' | 'rawMaterials' | 'products' | 'recipes' | 'orders' | 'productions' | 'dashboard'
  | 'fixedCosts' | 'assetPurchases' | 'staffPayroll' | 'miscExpenses'
  | 'customerDatabase' | 'wastageReport' | 'productPerformance'
  | 'humanResource' | 'menuEngineering' | 'documentation'
  | 'accounting' | 'cashFlow' | 'morningReport'

type FeatureFlags = Record<ModuleKey, boolean>

const MODULES: { key: ModuleKey; label: string }[] = [
  { key: 'dashboard',          label: 'Summary Dashboard' },
  { key: 'purchases',          label: 'Purchases' },
  { key: 'rawMaterials',       label: 'Raw Materials' },
  { key: 'products',           label: 'Products / SKU' },
  { key: 'recipes',            label: 'Recipes / Costing' },
  { key: 'orders',             label: 'Orders / Sales' },
  { key: 'productions',        label: 'Productions' },
  { key: 'fixedCosts',         label: 'Fixed Costs' },
  { key: 'assetPurchases',     label: 'Asset Purchases' },
  { key: 'staffPayroll',       label: 'Staff & Payroll' },
  { key: 'miscExpenses',       label: 'Misc Expenses' },
  { key: 'customerDatabase',   label: 'Customer Database' },
  { key: 'wastageReport',      label: 'Wastage Report' },
  { key: 'productPerformance', label: 'Product Performance' },
  { key: 'humanResource',      label: 'Human Resource' },
  { key: 'menuEngineering',    label: 'Menu Engineering' },
  { key: 'documentation',      label: 'Documentation' },
  { key: 'accounting',         label: 'Accounting' },
  { key: 'cashFlow',           label: 'Cash Flow Management' },
  { key: 'morningReport',      label: 'Morning Report' },
]

const DEFAULTS: FeatureFlags = Object.fromEntries(MODULES.map((m) => [m.key, false])) as FeatureFlags

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

  function setAll(value: boolean) {
    setFlags(Object.fromEntries(MODULES.map((m) => [m.key, value])) as FeatureFlags)
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
      setError('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-gray-500 p-6">Loading...</p>

  const enabledCount = MODULES.filter((m) => flags[m.key]).length

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Module Kill-Switches</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Global on/off for each module — applies to <strong>all organisations</strong> regardless of their subscription plan.
          Use to disable a module for maintenance or staged rollouts.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        <div className="px-4 py-2.5 flex items-center justify-between bg-gray-50 rounded-t-2xl">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Module</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{enabledCount}/{MODULES.length} enabled</span>
            <button onClick={() => setAll(true)} className="text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors">
              Enable all
            </button>
            <button onClick={() => setAll(false)} className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors">
              Disable all
            </button>
          </div>
        </div>
        {MODULES.map((mod) => (
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

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="bg-brand-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-brand-600 transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {saved && <p className="text-sm text-emerald-600 font-medium">Saved.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
