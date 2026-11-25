import { Router } from 'express'
import { z } from 'zod'
import { validateBody } from '../middleware/validateBody'
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

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(12),
  role: z.enum(['ADMIN', 'SUPERADMIN']).default('ADMIN'),
}).strict()

router.post('/', validateBody(createSchema), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body as z.infer<typeof createSchema>
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

const activeSchema = z.object({ isActive: z.boolean() }).strict()

router.patch('/:id/active', validateBody(activeSchema), async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const { isActive } = req.body as z.infer<typeof activeSchema>
    await userRepository.setUserActive({ id, isActive })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

const roleSchema = z.object({ role: z.enum(['ADMIN', 'SUPERADMIN']) }).strict()

router.patch('/:id/role', validateBody(roleSchema), async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const { role } = req.body as z.infer<typeof roleSchema>
    await userRepository.updateUserRole({ id, role })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export { router as portalUsersRouter }
