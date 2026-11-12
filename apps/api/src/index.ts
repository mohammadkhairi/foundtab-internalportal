import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

import { createApp } from './app'
import { env } from './config/env'
import { initDatabase } from './db/index'
import { startInvoiceBillingJob } from './jobs/invoiceBillingJob'

initDatabase()

const app = createApp()

app.listen(env.PORT, () => {
  console.log(`Portal API running on port ${env.PORT}`)
  startInvoiceBillingJob()
})
