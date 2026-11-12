import express from 'express'
import { requirePortalSecret } from './middleware/requirePortalSecret'
import { orgsRouter } from './routes/orgs'
import { plansRouter } from './routes/plans'
import { flagsRouter } from './routes/flags'
import { proxyRouter } from './routes/proxy'
import { authRouter } from './routes/auth'
import { jobsRouter } from './routes/jobs'

export function createApp() {
  const app = express()
  app.use(express.json())

  app.get('/health', (_req, res) => res.json({ ok: true }))

  // Auth routes — no portal secret required (login/setup are the security boundary)
  app.use('/api/auth', authRouter)

  // All other routes require the internal portal secret
  app.use(requirePortalSecret)

  // Layered routes — specific resources with audit logging
  app.use('/api/admin/orgs', orgsRouter)
  app.use('/api/admin/plans', plansRouter)
  app.use('/api/admin/feature-flags', flagsRouter)
  app.use('/api/admin/jobs', jobsRouter)

  // Catch-all proxy for anything not handled above
  app.use('/', proxyRouter)

  return app
}
