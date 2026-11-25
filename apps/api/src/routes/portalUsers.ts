import { Router } from 'express'
import { validateBody } from '../middleware/validateBody'
import { createPortalUserSchema, setActiveSchema, setRoleSchema } from '../request/portalUsers'
import * as userRepository from '../repositories/userRepository'
import * as userService from '../services/userService'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const users = await userRepository.listUsers()
    const safe = users.map(({ passwordHash: _, ...u }) => u)
    res.json(safe)
  } catch (err) {
    next(err)
  }
})

router.post('/', validateBody(createPortalUserSchema), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body as typeof createPortalUserSchema._type
    const callerRole = req.headers['x-caller-role']
    if (role === 'SUPERADMIN' && callerRole !== 'SUPERADMIN') {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Only a superadmin can create a superadmin user' })
      return
    }
    const existing = await userRepository.findByEmail({ email })
    if (existing) {
      res.status(409).json({ error: 'EMAIL_TAKEN', message: 'A user with this email already exists' })
      return
    }
    const user = await userService.createAdminUser({ name, email, password, role })
    const { passwordHash: _, ...safe } = user
    res.status(201).json(safe)
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/active', validateBody(setActiveSchema), async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const { isActive } = req.body as typeof setActiveSchema._type
    await userRepository.setUserActive({ id, isActive })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/role', validateBody(setRoleSchema), async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const { role } = req.body as typeof setRoleSchema._type
    const callerRole = req.headers['x-caller-role']
    if (role === 'SUPERADMIN' && callerRole !== 'SUPERADMIN') {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Only a superadmin can promote to superadmin' })
      return
    }
    await userRepository.updateUserRole({ id, role })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export { router as portalUsersRouter }
