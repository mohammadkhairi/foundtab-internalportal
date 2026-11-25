export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { adminFetch } from '@/lib/adminApi'
import { InviteUserModal } from './InviteUserModal'
import { UserRowActions } from './UserRowActions'

type PortalUser = {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'SUPERADMIN'
  isActive: boolean
  createdAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function UsersPage() {
  const session = await getServerSession()
  const allUsers = await adminFetch<PortalUser[]>('/api/admin/portal-users')
  const currentUserRole = (session?.user as { role?: 'ADMIN' | 'SUPERADMIN' } | undefined)?.role ?? 'ADMIN'
  const users = currentUserRole === 'SUPERADMIN' ? allUsers : allUsers.filter(u => u.role !== 'SUPERADMIN')

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portal Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} {users.length === 1 ? 'user' : 'users'}</p>
        </div>
        <InviteUserModal currentUserRole={currentUserRole} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.email === session?.user?.email
              return (
                <tr key={user.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.name}
                    {isSelf && <span className="ml-2 text-[10px] font-semibold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded-full">you</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      user.role === 'SUPERADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-brand-100 text-brand-700'
                    }`}>
                      {user.role === 'SUPERADMIN' ? 'Superadmin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <UserRowActions
                      id={user.id}
                      isActive={user.isActive}
                      role={user.role}
                      isSelf={isSelf}
                      currentUserRole={currentUserRole}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">No portal users yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
