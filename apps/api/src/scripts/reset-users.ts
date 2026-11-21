import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

import postgres from 'postgres'

async function run() {
  const client = postgres(process.env['DATABASE_URL'] ?? '', { max: 1 })
  const result = await client`TRUNCATE users RESTART IDENTITY CASCADE`
  console.log('Users table cleared:', result)
  await client.end()
}

run().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
