import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function runMigrations() {
  const client = postgres(process.env['DATABASE_URL'] ?? '', { max: 1 })
  const db = drizzle(client)

  console.log('Running portal API migrations...')
  await migrate(db, { migrationsFolder: 'src/db/migrations' })
  console.log('Migrations complete.')

  await client.end()
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
