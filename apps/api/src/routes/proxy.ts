import { Router } from 'express'
import { requirePortalSecret } from '../middleware/requirePortalSecret'
import { env } from '../config/env'

const router = Router()

router.all('*', requirePortalSecret, async (req, res, next) => {
  try {
    const url = `${env.FOUNDTAB_API_URL}${req.path}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
    const upstream = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-api-key': env.FOUNDTAB_ADMIN_API_KEY,
      },
      ...(hasBody ? { body: JSON.stringify(req.body) } : {}),
    })
    const data = await upstream.json() as unknown
    res.status(upstream.status).json(data)
  } catch (err) {
    next(err)
  }
})

export { router as proxyRouter }
