import { adminFetch } from '@/lib/adminApi'
import Link from 'next/link'
import AddPlanForm from './AddPlanForm'

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
  TRIAL:   'bg-gray-100 text-gray-600 border-gray-200',
  STARTER: 'bg-brand-50 text-brand-700 border-brand-200',
  GROWTH:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  ADVANCE: 'bg-violet-50 text-violet-700 border-violet-200',
  PRO:     'bg-amber-50 text-amber-700 border-amber-200',
}

export default async function PlansPage() {
  const plans = await adminFetch<Plan[]>('/api/admin/plans')
  const sorted = [...plans].sort((a, b) => a.tierOrder - b.tierOrder)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage plans and their module access.</p>
        </div>
        <AddPlanForm />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((plan) => {
          const enabledCount = plan.modules.filter((m) => m.enabled).length
          const totalCount = plan.modules.length
          const colorClass = PLAN_COLORS[plan.key] ?? 'bg-gray-50 text-gray-700 border-gray-200'

          return (
            <div
              key={plan.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colorClass}`}>
                    {plan.key}
                  </span>
                  {!plan.isActive && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                      Inactive
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">Tier {plan.tierOrder}</span>
              </div>

              <div>
                <p className="text-base font-semibold text-gray-900">{plan.label}</p>
                {plan.description && (
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{plan.description}</p>
                )}
              </div>

              {(plan.monthlyPrice || plan.yearlyPrice) && (
                <div className="flex gap-3 text-xs text-gray-600">
                  {plan.monthlyPrice && (
                    <span>RM {parseFloat(plan.monthlyPrice).toFixed(2)}<span className="text-gray-400">/mo</span></span>
                  )}
                  {plan.yearlyPrice && (
                    <span>RM {parseFloat(plan.yearlyPrice).toFixed(2)}<span className="text-gray-400">/yr</span></span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {enabledCount}/{totalCount} modules enabled
                </span>
                <Link
                  href={`/plans/${plan.id}`}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                >
                  Manage →
                </Link>
              </div>
            </div>
          )
        })}

        {sorted.length === 0 && (
          <div className="col-span-3 py-16 text-center">
            <p className="text-sm text-gray-400">No plans yet. Create one above.</p>
          </div>
        )}
      </div>
    </div>
  )
}
