import { prisma } from '@/lib/prisma'

export type Plan = 'free' | 'pro' | 'equipe'

export interface PlanLimits {
  name: string
  quotesPerMonth: number
  maxMembers: number
  featuresCount: number
  pdfCustomization: boolean
  prioritySupport: boolean
  dynamicLinks: boolean
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    name: 'Grátis',
    quotesPerMonth: 5,
    maxMembers: 1,
    featuresCount: 20,
    pdfCustomization: true,
    prioritySupport: false,
    dynamicLinks: false,
  },
  pro: {
    name: 'Pro',
    quotesPerMonth: Infinity,
    maxMembers: 1,
    featuresCount: Infinity,
    pdfCustomization: true,
    prioritySupport: true,
    dynamicLinks: true,
  },
  equipe: {
    name: 'Equipe',
    quotesPerMonth: Infinity,
    maxMembers: 5,
    featuresCount: Infinity,
    pdfCustomization: true,
    prioritySupport: true,
    dynamicLinks: true,
  },
}

// Legacy plan names from old onboarding flow mapped to current Plan types
const LEGACY_PLAN_MAP: Record<string, Plan> = {
  basic: 'pro',
}

export async function getActivePlan(organizationId: string): Promise<Plan> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      metadata: true,
      subscriptions: {
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { plan: true },
      },
    },
  })

  if (!org) return 'free'

  const activeSub = org.subscriptions[0]
  if (activeSub) {
    const p = activeSub.plan
    if (p in PLAN_LIMITS) return p as Plan
    if (p in LEGACY_PLAN_MAP) return LEGACY_PLAN_MAP[p]
    return 'free'
  }

  if (org.metadata) {
    try {
      const metadata = JSON.parse(org.metadata)
      const rawPlan: string | undefined = metadata.plan
      if (rawPlan) {
        if (rawPlan in PLAN_LIMITS) return rawPlan as Plan
        if (rawPlan in LEGACY_PLAN_MAP) return LEGACY_PLAN_MAP[rawPlan]
      }
    } catch {
      // metadata corrompido — trata como free
    }
  }

  return 'free'
}

export async function checkPlanLimit(organizationId: string) {
  const plan = await getActivePlan(organizationId)
  const limits = PLAN_LIMITS[plan]

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const quotesCount = await prisma.quote.count({
    where: { organizationId, createdAt: { gte: startOfMonth } },
  })

  return {
    plan,
    limits,
    usage: { quotesCount },
    isWithinLimits: quotesCount < limits.quotesPerMonth,
  }
}
