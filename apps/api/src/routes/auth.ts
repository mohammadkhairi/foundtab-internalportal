import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { validateBody } from '../middleware/validateBody'
import * as userRepository from '../repositories/userRepository'

const router = Router()

function validatePassword(password: string): string | null {
  if (password.length < 12) return 'Password must be at least 12 characters'
  if (!/[A-Z]/.test(password)) return 'Must contain at least one uppercase letter'
  if (!/[a-z]/.test(password)) return 'Must contain at least one lowercase letter'
  if (!/[0-9]/.test(password)) return 'Must contain at least one number'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Must contain at least one special character'
  return null
}

router.get('/has-users', async (_req, res, next) => {
  try {
    const users = await userRepository.listUsers()
    res.json({ hasUsers: users.length > 0 })
  } catch (err) {
    next(err)
  }
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
}).strict()

router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>
    const user = await userRepository.findByEmail({ email })
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' })
      return
    }
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' })
      return
    }
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role })
  } catch (err) {
    next(err)
  }
})

const setupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(12),
}).strict()

router.post('/setup', validateBody(setupSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body as z.infer<typeof setupSchema>

    const existing = await userRepository.listUsers()
    if (existing.length > 0) {
      res.status(409).json({ error: 'ALREADY_SETUP', message: 'Portal is already set up' })
      return
    }

    const pwError = validatePassword(password)
    if (pwError) {
      res.status(422).json({ error: 'WEAK_PASSWORD', message: pwError })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await userRepository.createUser({ email, name, passwordHash, role: 'SUPERADMIN' })
    res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role })
  } catch (err) {
    next(err)
  }
})

export { router as authRouter }
