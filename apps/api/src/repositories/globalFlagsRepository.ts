import { db } from '../db/index'
import { globalFeatureFlags } from '../db/schema/index'
import { eq } from 'drizzle-orm'

const DEFAULT_FLAGS = {
  purchases: false,
  rawMaterials: false,
  products: false,
  recipes: false,
  orders: false,
  productions: false,
  dashboard: false,
  fixedCosts: false,
  assetPurchases: false,
  staffPayroll: false,
  miscExpenses: false,
  customerDatabase: false,
  wastageReport: false,
  productPerformance: false,
  humanResource: false,
  menuEngineering: false,
  documentation: false,
  accounting: false,
  cashFlow: false,
  morningReport: false,
}

export type FlagData = typeof DEFAULT_FLAGS

export async function getFlags(): Promise<FlagData> {
  const row = await db().query.globalFeatureFlags.findFirst()
  if (!row) return { ...DEFAULT_FLAGS }
  return { ...DEFAULT_FLAGS, ...(row.data as Partial<FlagData>) }
}

export async function upsertFlags(data: FlagData): Promise<FlagData> {
  const existing = await db().query.globalFeatureFlags.findFirst()
  if (existing) {
    await db()
      .update(globalFeatureFlags)
      .set({ data, updatedAt: new Date() })
      .where(eq(globalFeatureFlags.id, existing.id))
  } else {
    await db().insert(globalFeatureFlags).values({ data })
  }
  return data
}
