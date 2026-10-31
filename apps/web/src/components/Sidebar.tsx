'use client'

import Link from 'next/link'
import Image from 'next/image'
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

  if (pathname === '/login') return null

  return (
    <aside className="w-56 bg-brand-950 border-r border-brand-900 flex flex-col min-h-screen">
      <div className="px-5 py-4 border-b border-brand-900 flex items-center gap-2.5">
        <Image src="/logo.png" alt="FoundTab" width={96} height={32} className="h-8 w-auto object-contain" />
        <span className="text-[10px] font-semibold text-brand-500 uppercase tracking-widest mt-0.5">Portal</span>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-500 text-white'
                  : 'text-brand-300 hover:bg-white/5 hover:text-brand-100'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {session?.user && (
        <div className="p-4 border-t border-brand-900">
          <p className="text-xs text-brand-500 truncate">{session.user.email}</p>
          <button
            onClick={() => void signOut({ callbackUrl: '/login' })}
            className="mt-2 text-xs text-brand-400 hover:text-brand-200 font-medium transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </aside>
  )
}
