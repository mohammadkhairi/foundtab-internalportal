'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const NAV = [
  { href: '/orgs', label: 'Organisations' },
  { href: '/feature-flags', label: 'Feature Flags' },
  { href: '/settings', label: 'Platform' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Don't show sidebar on login page
  if (pathname === '/login') return null

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <img src="/logo.png" alt="FoundTab" className="h-7" />
        <span className="text-xs text-gray-400">Portal</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                active ? 'bg-sky-50 text-sky-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {session?.user && (
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
          <button
            onClick={() => void signOut({ callbackUrl: '/login' })}
            className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Sign out
          </button>
        </div>
      )}
    </aside>
  )
}
