import { prisma } from '@/lib/prisma'

export interface OrgPlanInfo {
  plan: string
  count: number
}

export interface RecentOrg {
  id: string
  name: string
  plan: string
  createdAt: Date
}

export interface MonthlySeries {
  month: string
  value: number
}

export interface SubscriptionStatus {
  status: string
  count: number
}

export interface OwnerStats {
  totalUsers: number
  organizationsToday: number
  organizationsThisMonth: number
  totalOrganizations: number
  totalRevenue: number
  totalRevenueThisMonth: number
  activeSubscriptions: number
  usersByPlan: OrgPlanInfo[]
  recentOrganizations: RecentOrg[]
  revenueHistory: MonthlySeries[]
  userGrowth: MonthlySeries[]
  subscriptionsByStatus: SubscriptionStatus[]
}

export async function getOwnerStats(): Promise<OwnerStats> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [
    totalUsers,
    totalOrgs,
    revenueAgg,
    revenueThisMonth,
    subscriptions,
    allOrgs,
    billingHistory,
    users,
    orgsToday,
    orgsThisMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count(),
    prisma.billingHistory.aggregate({ _sum: { amount: true } }),
    prisma.billingHistory.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.subscription.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.organization.findMany({
      select: { id: true, name: true, metadata: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.billingHistory.findMany({
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.user.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.organization.count({
      where: { createdAt: { gte: startOfDay } },
    }),
    prisma.organization.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
  ])

  const planCounts: Record<string, number> = {}
  const recentOrgs: RecentOrg[] = allOrgs.slice(0, 10).map((org) => {
    const metadata = org.metadata ? JSON.parse(org.metadata) : {}
    const plan = metadata.plan || 'unknown'
    planCounts[plan] = (planCounts[plan] || 0) + 1
    return { id: org.id, name: org.name, plan, createdAt: org.createdAt }
  })

  const revenueByMonth: Record<string, number> = {}
  for (const bh of billingHistory) {
    const key = new Date(bh.createdAt)
      .toLocaleString('pt-BR', { month: 'short', year: '2-digit' })
      .replace('.', '')
      .replace(' ', '/')
    revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(bh.amount)
  }

  const usersByMonth: Record<string, number> = {}
  for (const u of users) {
    const key = new Date(u.createdAt)
      .toLocaleString('pt-BR', { month: 'short', year: '2-digit' })
      .replace('.', '')
      .replace(' ', '/')
    usersByMonth[key] = (usersByMonth[key] || 0) + 1
  }

  return {
    totalUsers,
    totalOrganizations: totalOrgs,
    totalRevenue: Number(revenueAgg._sum.amount || 0),
    totalRevenueThisMonth: Number(revenueThisMonth._sum.amount || 0),
    activeSubscriptions:
      subscriptions.find((s) => s.status === 'active')?._count || 0,
    organizationsToday: orgsToday,
    organizationsThisMonth: orgsThisMonth,
    usersByPlan: Object.entries(planCounts).map(([plan, count]) => ({
      plan,
      count,
    })),
    recentOrganizations: recentOrgs,
    revenueHistory: Object.entries(revenueByMonth).map(([month, value]) => ({
      month,
      value,
    })),
    userGrowth: Object.entries(usersByMonth).map(([month, value]) => ({
      month,
      value,
    })),
    subscriptionsByStatus: subscriptions.map((s) => ({
      status: s.status,
      count: s._count,
    })),
  }
}
