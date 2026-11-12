'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const EMPTY_FORM = { key: '', label: '', tierOrder: '', description: '', monthlyPrice: '', yearlyPrice: '' }

export default function AddPlanForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'key' ? value.toUpperCase() : value }))
  }

  function close() {
    setOpen(false)
    setForm(EMPTY_FORM)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: form.key,
          label: form.label,
          tierOrder: Number(form.tierOrder),
          description: form.description || undefined,
          monthlyPrice: form.monthlyPrice || undefined,
          yearlyPrice: form.yearlyPrice || undefined,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? 'Failed to create plan')
      }
      close()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors"
      >
        + Add Plan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">New Plan</h2>
              <button onClick={close} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Key <span className="text-red-500">*</span></label>
                  <input
                    name="key"
                    value={form.key}
                    onChange={handleChange}
                    required
                    placeholder="E.G. ENTERPRISE"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tier Order <span className="text-red-500">*</span></label>
                  <input
                    name="tierOrder"
                    type="number"
                    min="0"
                    value={form.tierOrder}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 5"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Label <span className="text-red-500">*</span></label>
                <input
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Enterprise"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Optional description"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Monthly price (MYR)</label>
                  <input
                    name="monthlyPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.monthlyPrice}
                    onChange={handleChange}
                    placeholder="e.g. 99.00"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Yearly price (MYR)</label>
                  <input
                    name="yearlyPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.yearlyPrice}
                    onChange={handleChange}
                    placeholder="e.g. 990.00"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-brand-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-40"
                >
                  {saving ? 'Creating...' : 'Create Plan'}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
