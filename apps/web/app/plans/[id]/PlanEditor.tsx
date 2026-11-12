'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  description: string | null
  isActive: boolean
  monthlyPrice: string | null
  yearlyPrice: string | null
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

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function moduleLabel(key: string): string {
  return MODULE_LABELS[key] ?? formatKey(key)
}

export default function PlanEditor({ plan }: { plan: Plan }) {
  const router = useRouter()

  const [label, setLabel] = useState(plan.label)
  const [description, setDescription] = useState(plan.description ?? '')
  const [isActive, setIsActive] = useState(plan.isActive)
  const [monthlyPrice, setMonthlyPrice] = useState(plan.monthlyPrice ?? '')
  const [yearlyPrice, setYearlyPrice] = useState(plan.yearlyPrice ?? '')
  const [metaSaving, setMetaSaving] = useState(false)
  const [metaError, setMetaError] = useState<string | null>(null)
  const [metaSaved, setMetaSaved] = useState(false)

  const [modules, setModules] = useState(plan.modules)
  const [togglingKey, setTogglingKey] = useState<string | null>(null)
  const [moduleError, setModuleError] = useState<string | null>(null)

  const [addModuleOpen, setAddModuleOpen] = useState(false)
  const [moduleSearch, setModuleSearch] = useState('')
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [addingModule, setAddingModule] = useState(false)
  const [addModuleError, setAddModuleError] = useState<string | null>(null)

  function isEnabled(moduleKey: string): boolean {
    return modules.find((m) => m.moduleKey === moduleKey)?.enabled ?? false
  }

  async function saveMetadata() {
    setMetaSaving(true)
    setMetaError(null)
    setMetaSaved(false)
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          description: description || undefined,
          isActive,
          monthlyPrice: monthlyPrice || null,
          yearlyPrice: yearlyPrice || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to update plan')
      setMetaSaved(true)
      router.refresh()
    } catch {
      setMetaError('Failed to save. Please try again.')
    } finally {
      setMetaSaving(false)
    }
  }

  async function toggleModule(moduleKey: string) {
    const current = isEnabled(moduleKey)
    const next = !current
    setTogglingKey(moduleKey)
    setModuleError(null)
    setModules((prev) =>
      prev.map((m) => (m.moduleKey === moduleKey ? { ...m, enabled: next } : m)),
    )
    try {
      const res = await fetch('/api/admin/plans/module-access', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, moduleKey, enabled: next }),
      })
      if (!res.ok) throw new Error('Failed')
    } catch {
      setModuleError(`Failed to update ${moduleLabel(moduleKey)}`)
      setModules((prev) =>
        prev.map((m) => (m.moduleKey === moduleKey ? { ...m, enabled: current } : m)),
      )
    } finally {
      setTogglingKey(null)
    }
  }

  function toggleSelected(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function handleAddSelected() {
    if (selectedKeys.size === 0) return
    setAddingModule(true)
    setAddModuleError(null)
    try {
      const results = await Promise.all(
        [...selectedKeys].map((key) =>
          fetch(`/api/admin/plans/${plan.id}/modules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moduleKey: key }),
          }).then(async (res) => {
            if (!res.ok) {
              const body = (await res.json().catch(() => ({}))) as { message?: string }
              throw new Error(body.message ?? `Failed to add ${key}`)
            }
            return res.json() as Promise<PlanModule>
          }),
        ),
      )
      setModules((prev) => [...prev, ...results])
      setSelectedKeys(new Set())
      setModuleSearch('')
      setAddModuleOpen(false)
    } catch (err) {
      setAddModuleError(err instanceof Error ? err.message : 'Failed to add modules')
    } finally {
      setAddingModule(false)
    }
  }

const enabledCount = modules.filter((m) => m.enabled).length
  const unaddedModules = Object.keys(MODULE_LABELS).filter(
    (key) => !modules.find((m) => m.moduleKey === key),
  )
  const filteredModules = moduleSearch.trim()
    ? unaddedModules.filter((key) =>
        MODULE_LABELS[key].toLowerCase().includes(moduleSearch.toLowerCase()),
      )
    : unaddedModules

  return (
    <div className="space-y-6">
      {/* Metadata */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Plan metadata</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
            <input
              value={label}
              onChange={(e) => { setLabel(e.target.value); setMetaSaved(false) }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setMetaSaved(false) }}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Monthly price (MYR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={monthlyPrice}
                onChange={(e) => { setMonthlyPrice(e.target.value); setMetaSaved(false) }}
                placeholder="e.g. 99.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Yearly price (MYR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={yearlyPrice}
                onChange={(e) => { setYearlyPrice(e.target.value); setMetaSaved(false) }}
                placeholder="e.g. 990.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              role="switch"
              aria-checked={isActive}
              onClick={() => { setIsActive((v) => !v); setMetaSaved(false) }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                isActive ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-gray-700">{isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={() => void saveMetadata()}
            disabled={metaSaving}
            className="bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-40"
          >
            {metaSaving ? 'Saving...' : 'Save changes'}
          </button>
          {metaSaved && <p className="text-sm text-emerald-600 font-medium">Saved.</p>}
          {metaError && <p className="text-sm text-red-600">{metaError}</p>}
        </div>
      </div>

      {/* Module access */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Module access</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{enabledCount} / {modules.length} enabled</span>
            <button
              onClick={() => { setAddModuleOpen(true); setAddModuleError(null); setModuleSearch(''); setSelectedKeys(new Set()) }}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 border border-brand-200 rounded-lg px-2.5 py-1 hover:bg-brand-50 transition-colors"
            >
              + Add module
            </button>
          </div>
        </div>

        {moduleError && (
          <div className="mx-5 mt-3 bg-red-50 border border-red-200 rounded-xl p-2 text-xs text-red-700">{moduleError}</div>
        )}

        <ul className="divide-y divide-gray-100">
          {modules.map((m) => {
            const enabled = isEnabled(m.moduleKey)
            const isToggling = togglingKey === m.moduleKey
            const isCustom = !(m.moduleKey in MODULE_LABELS)
            return (
              <li key={m.moduleKey} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="text-sm text-gray-900">{moduleLabel(m.moduleKey)}</span>
                  {isCustom && (
                    <span className="ml-2 text-xs font-mono text-gray-400">{m.moduleKey}</span>
                  )}
                </div>
                <button
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => void toggleModule(m.moduleKey)}
                  disabled={isToggling}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-60 ${
                    enabled ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Add module modal */}
      {addModuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAddModuleOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Add module</h2>
              <button onClick={() => setAddModuleOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {unaddedModules.length > 0 && (
              <input
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                placeholder="Search modules…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 mb-2"
                autoFocus
              />
            )}

            {unaddedModules.length > 0 ? (
              <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg max-h-64 overflow-y-auto mb-4">
                {filteredModules.length > 0 ? filteredModules.map((key) => {
                  const selected = selectedKeys.has(key)
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => toggleSelected(key)}
                        disabled={addingModule}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors disabled:opacity-40 ${
                          selected ? 'bg-brand-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className={selected ? 'text-brand-700 font-medium' : 'text-gray-900'}>
                          {MODULE_LABELS[key]}
                        </span>
                        <span className={`text-xs font-semibold ${selected ? 'text-brand-600' : 'text-gray-400'}`}>
                          {selected ? '✓ Selected' : '+ Add'}
                        </span>
                      </button>
                    </li>
                  )
                }) : (
                  <li className="px-3 py-4 text-xs text-gray-400 text-center">No modules match &ldquo;{moduleSearch}&rdquo;</li>
                )}
              </ul>
            ) : (
              <p className="text-xs text-gray-500 mb-4">All known modules are already on this plan.</p>
            )}

            {addModuleError && <p className="text-xs text-red-600 mt-3">{addModuleError}</p>}
            <div className="flex items-center justify-between mt-4 gap-2">
              <span className="text-xs text-gray-400">
                {selectedKeys.size > 0 ? `${selectedKeys.size} selected` : ''}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAddModuleOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleAddSelected()}
                  disabled={addingModule || selectedKeys.size === 0}
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-40"
                >
                  {addingModule ? 'Adding…' : `Add ${selectedKeys.size > 0 ? selectedKeys.size : ''} module${selectedKeys.size !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
