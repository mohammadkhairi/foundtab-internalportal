import bcrypt from 'bcryptjs'
import * as userRepo from '../repositories/userRepository'
import type { PortalRole } from '../db/schema/index'

const SALT_ROUNDS = 12

export async function verifyCredentials({ email, password }: { email: string; password: string }) {
  const user = await userRepo.findByEmail({ email })
  if (!user || !user.isActive) return null
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return null
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function createAdminUser({
  email,
  name,
  password,
  role,
}: {
  email: string
  name: string
  password: string
  role?: PortalRole
}) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  return userRepo.createUser({ email, name, passwordHash, role: role ?? 'ADMIN' })
}

export async function listUsers() {
  return userRepo.listUsers()
}
