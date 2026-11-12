import cron from 'node-cron'
import * as backend from '../services/backendApiService'

type OrgItem = { id: string; name?: string }

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

  let success = 0
  let skipped = 0
  let failed = 0

  for (const org of orgs) {
    try {
      await backend.generateInvoice({ orgId: org.id })
      console.log(`[invoiceBillingJob] ✓ Generated invoice for org ${org.id} (${org.name ?? '—'})`)
      success++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // Backend returns 422/400 for orgs with no active subscription — treat as expected skip
      if (msg.includes('subscription') || msg.includes('no active') || msg.includes('422') || msg.includes('400')) {
        console.log(`[invoiceBillingJob] — Skipped org ${org.id}: ${msg}`)
        skipped++
      } else {
        console.error(`[invoiceBillingJob] ✗ Failed org ${org.id}: ${msg}`)
        failed++
      }
    }
  }

  console.log(
    `[invoiceBillingJob] Done — ${success} generated, ${skipped} skipped (no subscription), ${failed} failed`,
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
