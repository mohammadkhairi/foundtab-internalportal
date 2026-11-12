import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../config/env'
import * as schema from './schema/index'

let _client: ReturnType<typeof postgres> | null = null
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function initDatabase() {
  if (_db) return _db
  _client = postgres(env.DATABASE_URL)
  _db = drizzle(_client, { schema })
  return _db
}

export function db() {
  if (!_db) throw new Error('Database not initialised — call initDatabase() first')
  return _db
}

export async function closeDatabase() {
  if (_client) {
    await _client.end()
    _client = null
    _db = null
  }
}
