'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'ADMIN' | 'SUPERADMIN'

type Props = {
  id: string
  isActive: boolean
  role: Role
  isSelf: boolean
  currentUserRole: Role
}

export function UserRowActions({ id, isActive, role, isSelf, currentUserRole }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeProtected = isSelf || (currentUserRole === 'ADMIN' && role === 'SUPERADMIN')
  const roleProtected = isSelf || currentUserRole === 'ADMIN'

  async function toggleActive() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/portal-users/${id}?action=active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (!res.ok) throw new Error('Failed')
      router.refresh()
    } catch {
      setError('Action failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function changeRole(newRole: Role) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/portal-users/${id}?action=role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error('Failed')
      router.refresh()
    } catch {
      setError('Action failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {error && <span className="text-xs text-red-500 w-full">{error}</span>}
      <select
        value={role}
        disabled={roleProtected || busy}
        onChange={(e) => void changeRole(e.target.value as Role)}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-40"
      >
        <option value="ADMIN">Admin</option>
        <option value="SUPERADMIN">Superadmin</option>
      </select>

      <button
        onClick={() => void toggleActive()}
        disabled={activeProtected || busy}
        className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors disabled:opacity-40 ${
          isActive
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-green-50 text-green-700 hover:bg-green-100'
        }`}
      >
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
    </div>
  )
}
