'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ROLES = ['OWNER', 'ADMIN', 'MEMBER'] as const
type Role = typeof ROLES[number]

type Props = {
  orgId: string
  clerkUserId: string
  currentRole: string
}

export default function MemberActions({ orgId, clerkUserId, currentRole }: Props) {
  const router = useRouter()
  const [role, setRole] = useState<Role>(currentRole as Role)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRoleChange(newRole: Role) {
    if (newRole === role) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}/members/${clerkUserId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error('Failed')
      setRole(newRole)
      router.refresh()
    } catch {
      setError('Failed to update role')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {

    setRemoving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orgs/${orgId}/members/${clerkUserId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed')
      router.refresh()
    } catch {
      setError('Failed to remove member')
      setRemoving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <select
        value={role}
        disabled={saving}
        onChange={(e) => void handleRoleChange(e.target.value as Role)}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-40"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <button
        onClick={() => void handleRemove()}
        disabled={removing}
        className="text-xs font-medium text-red-600 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-50 transition-colors disabled:opacity-40"
      >
        {removing ? '...' : 'Remove'}
      </button>
    </div>
  )
}
