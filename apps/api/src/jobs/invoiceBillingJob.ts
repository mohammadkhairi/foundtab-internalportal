import cron from 'node-cron'
import * as backend from '../services/backendApiService'
import { isBackendApiError } from '../services/backendApiService'

type OrgItem = { id: string; name?: string }

const CONCURRENCY = 5

async function processOrg(org: OrgItem): Promise<'success' | 'skipped' | 'failed'> {
  try {
    await backend.generateInvoice({ orgId: org.id })
    console.log(`[invoiceBillingJob] ✓ Generated invoice for org ${org.id} (${org.name ?? '—'})`)
    return 'success'
  } catch (err) {
    // Backend returns 422/400 for orgs with no active subscription — treat as expected skip
    if (isBackendApiError(err) && (err.status === 422 || err.status === 400)) {
      console.log(`[invoiceBillingJob] — Skipped org ${org.id}: ${err.message}`)
      return 'skipped'
    }
    console.error(`[invoiceBillingJob] ✗ Failed org ${org.id}:`, err)
    return 'failed'
  }
}

async function runInvoiceGeneration() {
  console.log('[invoiceBillingJob] Starting monthly invoice generation...')

  let orgs: OrgItem[]
  try {
    orgs = (await backend.listOrgs()) as OrgItem[]
  } catch (err) {
    console.error('[invoiceBillingJob] Failed to fetch orgs:', err)
    return
  }

  console.log(`[invoiceBillingJob] Processing ${orgs.length} orgs`)

  const results = { success: 0, skipped: 0, failed: 0 }

  for (let i = 0; i < orgs.length; i += CONCURRENCY) {
    const batch = orgs.slice(i, i + CONCURRENCY)
    const outcomes = await Promise.all(batch.map(processOrg))
    for (const outcome of outcomes) results[outcome]++
  }

  console.log(
    `[invoiceBillingJob] Done — ${results.success} generated, ${results.skipped} skipped (no subscription), ${results.failed} failed`,
  )
}

// Runs on the 1st of every month at 08:00 server time
export function startInvoiceBillingJob() {
  cron.schedule('0 8 1 * *', () => {
    void runInvoiceGeneration()
  })
  console.log('[invoiceBillingJob] Scheduled: 1st of each month at 08:00')
}

export { runInvoiceGeneration }
