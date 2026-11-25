import { z } from 'zod'

export const createPortalUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(12),
  role: z.enum(['ADMIN', 'SUPERADMIN']).default('ADMIN'),
}).strict()

export const setActiveSchema = z.object({
  isActive: z.boolean(),
}).strict()

export const setRoleSchema = z.object({
  role: z.enum(['ADMIN', 'SUPERADMIN']),
}).strict()
