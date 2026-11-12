import { eq } from 'drizzle-orm'
import { db } from '../db/index'
import { portalUsers, type NewPortalUser } from '../db/schema/index'

export async function findByEmail({ email }: { email: string }) {
  return db().query.portalUsers.findFirst({
    where: eq(portalUsers.email, email),
  })
}

export async function findById({ id }: { id: string }) {
  return db().query.portalUsers.findFirst({
    where: eq(portalUsers.id, id),
  })
}

export async function listUsers() {
  return db().query.portalUsers.findMany()
}

export async function createUser({ email, name, passwordHash, role }: NewPortalUser) {
  const [user] = await db()
    .insert(portalUsers)
    .values({ email, name, passwordHash, role })
    .returning()
  return user!
}

export async function setUserActive({ id, isActive }: { id: string; isActive: boolean }) {
  await db()
    .update(portalUsers)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(portalUsers.id, id))
}
