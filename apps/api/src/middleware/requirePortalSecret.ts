import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

export function requirePortalSecret(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers['x-portal-secret']
  if (!secret || secret !== env.PORTAL_INTERNAL_SECRET) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}
