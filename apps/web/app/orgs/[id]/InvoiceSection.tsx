'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Invoice = {
  id: string
  invoiceNumber: string
  amount: string
  currency: string
  status: 'PENDING' | 'PAID' | 'VOID'
  description: string | null
  dueDate: string | null
  paidAt: string | null
  createdAt: string
}

type Props = {
  orgId: string
  initialInvoices: Invoice[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID:    'bg-green-100 text-green-700',
  VOID:    'bg-gray-100 text-gray-500',
}

const EMPTY_FORM = {
  invoiceNumber: '',
  amount: '',
  currency: 'MYR',
  description: '',
  dueDate: '',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function InvoiceSection({ orgId, initialInvoices }: Props) {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleGenerate() {

    setGenerating(true)
    setCreateError(null)
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}/invoices/generate`, { method: 'POST' })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(body.message ?? 'Failed to generate invoice')
      }
      const created = (await res.json()) as Invoice
      setInvoices((prev) => [created, ...prev])
      router.refresh()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setGenerating(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)
    try {
      const payload: Record<string, string> = {
        invoiceNumber: form.invoiceNumber,
        amount: form.amount,
        currency: form.currency,
      }
      if (form.description) payload.description = form.description
      if (form.dueDate) payload.dueDate = new Date(form.dueDate).toISOString()

      const res = await fetch(`/api/admin/orgs/${orgId}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(body.message ?? 'Failed to create invoice')
      }
      const created = (await res.json()) as Invoice
      setInvoices((prev) => [created, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
      router.refresh()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setCreating(false)
    }
  }

  async function handleStatusUpdate(invoiceId: string, status: 'PENDING' | 'PAID' | 'VOID') {
    setProcessingId(invoiceId)
    setActionError(null)
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      const updated = (await res.json()) as Invoice
      setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? updated : inv)))
    } catch {
      setActionError('Failed to update invoice status')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleDelete(invoiceId: string) {

    setProcessingId(invoiceId)
    setActionError(null)
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}/invoices/${invoiceId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId))
    } catch {
      setActionError('Failed to delete invoice')
      setProcessingId(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Invoices ({invoices.length})
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleGenerate()}
            disabled={generating}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 border border-emerald-200 rounded-lg px-2.5 py-1 hover:bg-emerald-50 transition-colors disabled:opacity-40"
          >
            {generating ? 'Generating…' : '⚡ Generate from subscription'}
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add manual'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={(e) => void handleCreate(e)} className="p-4 border-b border-gray-100 bg-gray-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Invoice Number</label>
              <input
                name="invoiceNumber"
                value={form.invoiceNumber}
                onChange={handleFormChange}
                required
                placeholder="INV-001"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
              <input
                name="amount"
                value={form.amount}
                onChange={handleFormChange}
                required
                placeholder="299.00"
                pattern="^\d+(\.\d{1,2})?$"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
              <input
                name="currency"
                value={form.currency}
                onChange={handleFormChange}
                placeholder="MYR"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
              <input
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleFormChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Optional"
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          {createError && <p className="text-xs text-red-600">{createError}</p>}
          <button
            type="submit"
            disabled={creating}
            className="bg-brand-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-40"
          >
            {creating ? 'Creating...' : 'Create Invoice'}
          </button>
        </form>
      )}

      {actionError && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-xl p-2 text-xs text-red-700">{actionError}</div>
      )}

      {invoices.length === 0 ? (
        <p className="text-sm text-gray-400 px-4 py-6 text-center">No invoices yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice #</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Due</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">
                  <div>{inv.invoiceNumber}</div>
                  {inv.description && <div className="text-xs text-gray-400">{inv.description}</div>}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {inv.currency} {parseFloat(inv.amount).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/api/admin/orgs/${orgId}/invoices/${inv.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-brand-600 border border-brand-200 rounded-lg px-2 py-1 hover:bg-brand-50 transition-colors"
                    >
                      PDF
                    </a>
                    {inv.status === 'PENDING' && (
                      <button
                        onClick={() => void handleStatusUpdate(inv.id, 'PAID')}
                        disabled={processingId === inv.id}
                        className="text-xs font-medium text-green-700 border border-green-200 rounded-lg px-2 py-1 hover:bg-green-50 transition-colors disabled:opacity-40"
                      >
                        Mark Paid
                      </button>
                    )}
                    {inv.status !== 'VOID' && (
                      <button
                        onClick={() => void handleStatusUpdate(inv.id, 'VOID')}
                        disabled={processingId === inv.id}
                        className="text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-50 transition-colors disabled:opacity-40"
                      >
                        Void
                      </button>
                    )}
                    <button
                      onClick={() => void handleDelete(inv.id)}
                      disabled={processingId === inv.id}
                      className="text-xs font-medium text-red-600 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
