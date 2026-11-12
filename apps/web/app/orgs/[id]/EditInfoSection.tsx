'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type OrgInfo = {
  name: string
  billingCycle: 'MONTHLY' | 'YEARLY' | null
  address: string | null
  contactNumber: string | null
  contactEmail: string | null
  website: string | null
  registrationNumber: string | null
  industry: string | null
}

export default function EditInfoSection({ orgId, org }: { orgId: string; org: OrgInfo }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: org.name,
    billingCycle: org.billingCycle ?? '',
    address: org.address ?? '',
    contactNumber: org.contactNumber ?? '',
    contactEmail: org.contactEmail ?? '',
    website: org.website ?? '',
    registrationNumber: org.registrationNumber ?? '',
    industry: org.industry ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const payload: Record<string, string | null> = {}
      if (form.name) payload.name = form.name
      payload.billingCycle = form.billingCycle || null
      if (form.address !== undefined) payload.address = form.address
      if (form.contactNumber !== undefined) payload.contactNumber = form.contactNumber
      if (form.contactEmail !== undefined) payload.contactEmail = form.contactEmail
      if (form.website !== undefined) payload.website = form.website
      if (form.registrationNumber !== undefined) payload.registrationNumber = form.registrationNumber
      if (form.industry !== undefined) payload.industry = form.industry

      const res = await fetch(`/api/admin/orgs/${orgId}/info`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSaved(true)
      router.refresh()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Edit contact info</h2>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Billing Cycle</label>
          <select
            name="billingCycle"
            value={form.billingCycle}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
          >
            <option value="">— Not set —</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Contact Number</label>
            <input
              name="contactNumber"
              value={form.contactNumber}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Contact Email</label>
            <input
              name="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
            <input
              name="website"
              type="url"
              value={form.website}
              onChange={handleChange}
              placeholder="https://"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Industry</label>
            <input
              name="industry"
              value={form.industry}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Registration Number</label>
          <input
            name="registrationNumber"
            value={form.registrationNumber}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {saved && <p className="text-sm text-emerald-600 font-medium">Saved.</p>}
        </div>
      </form>
    </div>
  )
}
