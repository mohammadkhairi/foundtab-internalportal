import { adminFetch } from '@/lib/adminApi'
import Link from 'next/link'
import PlanEditor from './PlanEditor'

type PlanModule = {
  id: string
  planId: string
  moduleKey: string
  enabled: boolean
}

type Plan = {
  id: string
  key: string
  label: string
  tierOrder: number
  description: string | null
  isActive: boolean
  monthlyPrice: string | null
  yearlyPrice: string | null
  modules: PlanModule[]
}

const PLAN_COLORS: Record<string, string> = {
  TRIAL:   'bg-gray-100 text-gray-600',
  STARTER: 'bg-brand-100 text-brand-700',
  GROWTH:  'bg-emerald-100 text-emerald-700',
  ADVANCE: 'bg-violet-100 text-violet-700',
  PRO:     'bg-amber-100 text-amber-700',
}

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plan = await adminFetch<Plan>(`/api/admin/plans/${id}`)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/plans" className="text-sm text-brand-600 hover:text-brand-800">&larr; Plans</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{plan.label}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PLAN_COLORS[plan.key] ?? 'bg-gray-100 text-gray-600'}`}>
              {plan.key}
            </span>
            <span className="text-xs text-gray-400">Tier {plan.tierOrder}</span>
            {plan.isActive ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
            ) : (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">Inactive</span>
            )}
          </div>
        </div>
      </div>

      <PlanEditor plan={plan} />
    </div>
  )
}
