'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ROLES = ['MEMBER', 'ADMIN', 'OWNER'] as const
type Role = (typeof ROLES)[number]

export default function AddMemberButton({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<Role>('MEMBER')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openModal() {
    setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setConfirmPassword('')
    setRole('MEMBER'); setError(null); setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 15) { setError('Password must be at least 15 characters'); return }
    setCreating(true); setError(null)
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}/members/create-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          role,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(body.message ?? 'Failed to create user')
      }
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="text-xs font-semibold text-brand-600 hover:text-brand-800 border border-brand-200 rounded-lg px-2.5 py-1 hover:bg-brand-50 transition-colors"
      >
        + Add member
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Add member</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">First name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ali"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last name</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Hassan"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="ali@example.com" required autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password <span className="text-red-500">*</span></label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 15 characters" required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Confirm password <span className="text-red-500">*</span></label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password" required
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                    confirmPassword && confirmPassword !== password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`} />
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={creating || !email || !password || password !== confirmPassword}
                  className="flex-1 bg-brand-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-40">
                  {creating ? 'Creating…' : 'Create & add'}
                </button>
                <button type="button" onClick={() => setOpen(false)}
                  className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-400 mt-4 text-center">
              This user can sign in to FoundTab web using their email and password.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
