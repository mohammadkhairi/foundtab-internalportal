import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { createApp } from './app'
import { env } from './config/env'
import { initDatabase, db } from './db/index'
import { startInvoiceBillingJob } from './jobs/invoiceBillingJob'

async function main() {
  initDatabase()

  await migrate(db(), { migrationsFolder: path.resolve(__dirname, '../migrations') })
  console.log('Migrations applied')

  const app = createApp()
  app.listen(env.PORT, () => {
    console.log(`Portal API running on port ${env.PORT}`)
    startInvoiceBillingJob()
  })
}

main().catch(err => {
  console.error('Startup failed:', err)
  process.exit(1)
})
