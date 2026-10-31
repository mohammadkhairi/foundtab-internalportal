import { z } from 'zod'

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  FOUNDTAB_API_URL: z.string().url().default('http://localhost:8080'),
  FOUNDTAB_ADMIN_API_KEY: z.string().min(32),
  PORTAL_INTERNAL_SECRET: z.string().min(32),
})

function loadEnv() {
  const result = schema.safeParse(process.env)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    const message = Object.entries(errors)
      .map(([k, v]) => `${k}: ${v?.join(', ')}`)
      .join('\n')
    throw new Error(`Invalid environment variables:\n${message}`)
  }
  return result.data
}

export const env = loadEnv()
