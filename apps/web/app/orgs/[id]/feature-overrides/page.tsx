'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type FeatureKey = 'ocr' | 'whatsapp_parser' | 'push_notifications' | 'multi_user' | 'data_export' | 'advanced_reports'

type StoredOverride = {
  id: string
  feature: string
  enabled: boolean
  expiresAt: string | null
}

const FEATURES: { key: FeatureKey; label: string; description: string }[] = [
  { key: 'ocr',                label: 'OCR Receipt Scanning',    description: 'AI-powered receipt data extraction from photos.' },
  { key: 'whatsapp_parser',    label: 'WhatsApp Order Parser',   description: 'Parse orders from WhatsApp messages automatically.' },
  { key: 'push_notifications', label: 'Push Notifications',      description: 'Browser push alerts for stock and order updates.' },
  { key: 'multi_user',         label: 'Multi-user',              description: 'More than one user per organisation.' },
  { key: 'data_export',        label: 'Data Export',             description: 'Export reports and data to CSV.' },
  { key: 'advanced_reports',   label: 'Advanced Reports',        description: 'Access to advanced analytics and reporting modules.' },
]

const EMPTY_STATE: Record<FeatureKey, boolean> = {
  ocr: false, whatsapp_parser: false, push_notifications: false,
  multi_user: false, data_export: false, advanced_reports: false,
}

export default function FeatureOverridesPage() {
  const { id } = useParams<{ id: string }>()
  const [overrides, setOverrides] = useState<Record<FeatureKey, boolean>>(EMPTY_STATE)
  const [storedIds, setStoredIds] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orgs/${id}/feature-overrides`)
      .then((r) => r.json() as Promise<StoredOverride[]>)
      .then((stored) => {
        const next = { ...EMPTY_STATE }
        const ids: Record<string, string> = {}
        for (const s of stored) {
          if (s.feature in next) {
            next[s.feature as FeatureKey] = s.enabled
            ids[s.feature] = s.id
          }
        }
        setOverrides(next)
        setStoredIds(ids)
      })
      .catch(() => setError('Failed to load overrides.'))
      .finally(() => setLoading(false))
  }, [id])

  function toggle(key: FeatureKey) {
    setOverrides((prev) => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await Promise.all(
        FEATURES.map((f) =>
          fetch(`/api/admin/orgs/${id}/feature-overrides`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feature: f.key, enabled: overrides[f.key] }),
          }),
        ),
      )
      setSaved(true)
    } catch {
      setError('Failed to save overrides. Try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-gray-500 p-6">Loading...</p>

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link href={`/orgs/${id}`} className="text-sm text-brand-600 hover:text-brand-800">&larr; Back to org</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Feature Overrides</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Force-enable or force-disable capability features for this org, independent of their subscription plan.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {FEATURES.map((feature) => (
          <div key={feature.key} className="flex items-start justify-between gap-4 p-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{feature.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
              {storedIds[feature.key] && (
                <p className="text-xs text-gray-400 mt-0.5 font-mono">id: {storedIds[feature.key]}</p>
              )}
            </div>
            <button
              role="switch"
              aria-checked={overrides[feature.key]}
              onClick={() => toggle(feature.key)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                overrides[feature.key] ? 'bg-brand-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  overrides[feature.key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-emerald-600 font-medium">Overrides saved.</p>}

      <button
        onClick={() => void handleSave()}
        disabled={saving}
        className="bg-brand-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-60 hover:bg-brand-600 transition-colors"
      >
        {saving ? 'Saving...' : 'Save overrides'}
      </button>
    </div>
  )
}
