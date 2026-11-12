'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

type Rule = { label: string; test: (pw: string) => boolean }

const PASSWORD_RULES: Rule[] = [
  { label: 'At least 12 characters', test: (pw) => pw.length >= 12 },
  { label: 'Uppercase letter (A–Z)', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Lowercase letter (a–z)', test: (pw) => /[a-z]/.test(pw) },
  { label: 'Number (0–9)', test: (pw) => /[0-9]/.test(pw) },
  { label: 'Special character (!@#$…)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
]

export default function SetupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/portal-auth')
        const data = (await res.json()) as { hasUsers: boolean }
        if (data.hasUsers) router.replace('/login')
      } finally {
        setChecking(false)
      }
    })()
  }, [router])

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password))
  const passwordsMatch = password === confirmPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allRulesPassed) { setError('Password does not meet requirements'); return }
    if (!passwordsMatch) { setError('Passwords do not match'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/portal-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(body.message ?? 'Setup failed')
      }
      // Auto sign-in after setup
      await signIn('credentials', { email, password, callbackUrl: '/orgs' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
      setLoading(false)
    }
  }

  if (checking) return null

  return (
    <div className="fixed inset-0 bg-brand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="FoundTab" className="h-10 w-auto mx-auto"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <span className="inline-block text-xs font-semibold text-brand-600 bg-brand-100 px-2.5 py-0.5 rounded-full tracking-wide uppercase">
            Admin Portal
          </span>
          <p className="text-sm text-gray-500 pt-1">Create your admin account to get started.</p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Your name" required autoFocus
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" required
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" required
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />

          {/* Password rules */}
          {password && (
            <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-1.5">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(password)
                return (
                  <div key={rule.label} className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${passed ? 'text-emerald-500' : 'text-gray-300'}`}>
                      {passed ? '✓' : '·'}
                    </span>
                    <span className={`text-xs ${passed ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {rule.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password" required
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              confirmPassword && !passwordsMatch ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`} />
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit"
            disabled={loading || !allRulesPassed || !passwordsMatch || !name || !email}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors">
            {loading ? 'Creating account…' : 'Create admin account'}
          </button>
        </form>
      </div>
    </div>
  )
}
