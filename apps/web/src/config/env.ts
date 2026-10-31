import { z } from 'zod'

const schema = z.object({
  PORTAL_API_URL: z.string().url().default('http://localhost:4000'),
  PORTAL_INTERNAL_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_ENV: z.enum(['local', 'staging', 'production']).default('local'),
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
