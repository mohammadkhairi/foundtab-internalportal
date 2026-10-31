import express from 'express'
import { proxyRouter } from './routes/proxy'

export function createApp() {
  const app = express()
  app.use(express.json())

  app.get('/health', (_req, res) => res.json({ ok: true }))

  app.use('/', proxyRouter)

  return app
}
