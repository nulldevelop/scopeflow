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
    quotesPerMonth: 999999,
    maxMembers: 1,
    featuresCount: 999999,
    pdfCustomization: true,
    prioritySupport: true,
    dynamicLinks: true,
  },
  equipe: {
    name: 'Equipe',
    quotesPerMonth: 999999,
    maxMembers: 5,
    featuresCount: 999999,
    pdfCustomization: true,
    prioritySupport: true,
    dynamicLinks: true,
  },
}

export async function getActivePlan(organizationId: string): Promise<Plan> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      organizationId,
      status: 'active'
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!subscription) {
    // Verificar se existe plano definido no metadata da organização (legado onboarding)
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { metadata: true }
    })

    if (org?.metadata) {
      const metadata = JSON.parse(org.metadata)
      if (metadata.plan === 'basic' || metadata.plan === 'pro') {
         return metadata.plan as Plan
      }
    }
    return 'free'
  }

  return (subscription.plan as Plan) || 'free'
}

export async function checkPlanLimit(organizationId: string) {
  const plan = await getActivePlan(organizationId)
  const limits = PLAN_LIMITS[plan]

  // Contar orçamentos do mês atual
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const quotesCount = await prisma.quote.count({
    where: {
      organizationId,
      createdAt: { gte: startOfMonth }
    }
  })

  return {
    plan,
    limits,
    usage: {
      quotesCount,
    },
    isWithinLimits: quotesCount < limits.quotesPerMonth
  }
}
