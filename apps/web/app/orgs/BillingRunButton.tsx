'use client'

import { useState } from 'react'

export default function BillingRunButton() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleRun() {
    setRunning(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/jobs/invoice-generation', { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      setResult('Billing job started — check API logs for results.')
    } catch {
      setResult('Failed to start billing job.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => void handleRun()}
        disabled={running}
        className="text-xs font-semibold text-violet-600 hover:text-violet-800 border border-violet-200 rounded-lg px-2.5 py-1.5 hover:bg-violet-50 transition-colors disabled:opacity-40"
      >
        {running ? 'Running…' : '⚡ Run billing for all orgs'}
      </button>
      {result && <p className="text-xs text-gray-500">{result}</p>}
    </div>
  )
}
