import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(__dirname, '.env.local') })

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['DATABASE_URL'] ?? '',
  },
})
