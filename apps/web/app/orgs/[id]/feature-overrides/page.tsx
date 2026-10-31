'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

const AVAILABLE_FEATURES = [
  { key: 'whatsapp_parser', label: 'WhatsApp Order Parser', description: 'AI-powered order parsing from WhatsApp messages.' },
  { key: 'ocr_receipts', label: 'OCR Receipt Scanning', description: 'Automatic data extraction from receipt photos.' },
  { key: 'advanced_export', label: 'Advanced Export', description: 'Export data to CSV with date filtering.' },
  { key: 'multi_outlet', label: 'Multi-outlet', description: 'Manage multiple business outlets.' },
  { key: 'push_notifications', label: 'Push Notifications', description: 'Browser push for stock alerts and order updates.' },
]

type OverrideState = {
  feature: string
  enabled: boolean
}

export default function FeatureOverridesPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [overrides, setOverrides] = useState<OverrideState[]>(
    AVAILABLE_FEATURES.map((f) => ({ feature: f.key, enabled: false })),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function toggle(feature: string) {
    setOverrides((prev) =>
      prev.map((o) => (o.feature === feature ? { ...o, enabled: !o.enabled } : o)),
    )
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch(`/api/admin/orgs/${id}/feature-overrides`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overrides: overrides.reduce<Record<string, boolean>>((acc, o) => {
            if (o.enabled) acc[o.feature] = true
            return acc
          }, {}),
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSuccess(true)
      setTimeout(() => router.push(`/orgs/${id}`), 1200)
    } catch {
      setError('Failed to save overrides. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href={`/orgs/${id}`} className="text-sm text-brand-600 hover:text-brand-800">&larr; Back to org</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Feature Overrides</h1>
        <p className="text-sm text-gray-500 mt-0.5">Force-enable or force-disable features for this organisation.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {AVAILABLE_FEATURES.map((feature) => {
          const override = overrides.find((o) => o.feature === feature.key)
          return (
            <div key={feature.key} className="flex items-start justify-between gap-4 p-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{feature.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
              </div>
              <button
                role="switch"
                aria-checked={override?.enabled ?? false}
                onClick={() => toggle(feature.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                  override?.enabled ? 'bg-brand-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    override?.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600 font-medium">Saved! Redirecting...</p>}

      <button
        onClick={() => void handleSave()}
        disabled={saving}
        className="bg-brand-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save overrides'}
      </button>
    </div>
  )
}
