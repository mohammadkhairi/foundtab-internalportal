import { Router } from 'express'
import { runInvoiceGeneration } from '../jobs/invoiceBillingJob'

const router = Router()

router.post('/invoice-generation/run', async (_req, res, next) => {
  try {
    // Fire-and-forget — returns immediately, job runs in background
    void runInvoiceGeneration()
    res.json({ ok: true, message: 'Invoice generation job started' })
  } catch (err) {
    next(err)
  }
})

export { router as jobsRouter }
