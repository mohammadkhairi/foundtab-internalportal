'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLANS = ['TRIAL', 'STARTER', 'GROWTH', 'ADVANCE', 'PRO'] as const

type FormState = {
  name: string
  registrationNumber: string
  address: string
  contactNumber: string
  contactEmail: string
  website: string
  industry: string
  plan: string
  billingCycle: string
}

const INITIAL_FORM: FormState = {
  name: '',
  registrationNumber: '',
  address: '',
  contactNumber: '',
  contactEmail: '',
  website: '',
  industry: '',
  plan: 'TRIAL',
  billingCycle: '',
}

type CreatedOrg = { id: string }

export default function CreateOrgForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, string> = { name: form.name, plan: form.plan }
      if (form.billingCycle) payload.billingCycle = form.billingCycle
      if (form.registrationNumber) payload.registrationNumber = form.registrationNumber
      if (form.address) payload.address = form.address
      if (form.contactNumber) payload.contactNumber = form.contactNumber
      if (form.contactEmail) payload.contactEmail = form.contactEmail
      if (form.website) payload.website = form.website
      if (form.industry) payload.industry = form.industry

      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
        throw new Error(body.message ?? body.error ?? 'Failed to create organisation')
      }

      const org = (await res.json()) as CreatedOrg
      router.push(`/orgs/${org.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Acme Sdn Bhd"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Registration Number</label>
        <input
          name="registrationNumber"
          value={form.registrationNumber}
          onChange={handleChange}
          placeholder="e.g. 202301012345"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address</label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={2}
          placeholder="Full address"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contact Number</label>
          <input
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleChange}
            placeholder="+60 12-345 6789"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contact Email</label>
          <input
            name="contactEmail"
            type="email"
            value={form.contactEmail}
            onChange={handleChange}
            placeholder="hello@acme.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Website</label>
          <input
            name="website"
            type="url"
            value={form.website}
            onChange={handleChange}
            placeholder="https://acme.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Industry</label>
          <input
            name="industry"
            value={form.industry}
            onChange={handleChange}
            placeholder="e.g. F&B"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Plan</label>
          <select
            name="plan"
            value={form.plan}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
          >
            {PLANS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Billing Cycle</label>
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
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-brand-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-40"
        >
          {saving ? 'Creating...' : 'Create Organisation'}
        </button>
        <a
          href="/orgs"
          className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
