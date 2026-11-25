'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PASSWORD_RULES = [
  { label: 'At least 12 characters', test: (pw: string) => pw.length >= 12 },
  { label: 'Uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'Lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'Number', test: (pw: string) => /[0-9]/.test(pw) },
  { label: 'Special character', test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
]

export function InviteUserModal({ currentUserRole }: { currentUserRole: 'ADMIN' | 'SUPERADMIN' }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'SUPERADMIN'>('ADMIN')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allRulesPassed) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/portal-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(body.message ?? 'Failed to create user')
      }
      setOpen(false)
      setName(''); setEmail(''); setPassword(''); setRole('ADMIN')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors"
      >
        Add user
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Add portal user</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Full name" required autoFocus
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email" required
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Temporary password" required
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              {password && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password)
                    return (
                      <div key={rule.label} className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${passed ? 'text-emerald-500' : 'text-gray-300'}`}>{passed ? '✓' : '·'}</span>
                        <span className={`text-xs ${passed ? 'text-emerald-600' : 'text-gray-400'}`}>{rule.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              <select
                value={role} onChange={(e) => setRole(e.target.value as 'ADMIN' | 'SUPERADMIN')}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="ADMIN">Admin</option>
                {currentUserRole === 'SUPERADMIN' && (
                  <option value="SUPERADMIN">Superadmin</option>
                )}
              </select>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button" onClick={() => setOpen(false)}
                  className="flex-1 text-sm font-medium border border-gray-200 rounded-xl py-2 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !allRulesPassed || !name || !email}
                  className="flex-1 bg-brand-500 text-white text-sm font-semibold py-2 rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating…' : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
