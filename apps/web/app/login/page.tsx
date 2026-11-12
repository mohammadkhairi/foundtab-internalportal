'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/portal-auth')
        const data = (await res.json()) as { hasUsers: boolean }
        if (!data.hasUsers) router.replace('/setup')
      } finally {
        setChecking(false)
      }
    })()
  }, [router])

  const errorMessage =
    error === 'AccessDenied' ? 'You are not authorised to access this portal.' :
    error ? 'Sign-in failed. Check your email and password.' : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn('credentials', { email, password, callbackUrl: '/orgs' })
    setLoading(false)
  }

  if (checking) return null

  return (
    <div className="fixed inset-0 bg-brand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="FoundTab" className="h-10 w-auto mx-auto"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <span className="inline-block text-xs font-semibold text-brand-600 bg-brand-100 px-2.5 py-0.5 rounded-full tracking-wide uppercase">
            Admin Portal
          </span>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" required autoFocus
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" required
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 transition-colors">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
