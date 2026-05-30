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

type MonthlyRow = { month: string; value: string | number | bigint }

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
    recentOrgsRaw,
    allOrgsMetadata,
    revenueRows,
    userRows,
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
    prisma.subscription.groupBy({ by: ['status'], _count: true }),
    prisma.organization.findMany({
      select: { id: true, name: true, metadata: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    // Only fetch metadata for plan distribution — no row limit
    prisma.organization.findMany({ select: { metadata: true } }),
    prisma.$queryRaw<MonthlyRow[]>`
      SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon/YY') AS month,
             SUM(amount)::text AS value
      FROM billing_history
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `,
    prisma.$queryRaw<MonthlyRow[]>`
      SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon/YY') AS month,
             COUNT(*)::text AS value
      FROM "user"
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `,
    prisma.organization.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.organization.count({ where: { createdAt: { gte: startOfMonth } } }),
  ])

  // Plan distribution from all orgs
  const planCounts: Record<string, number> = {}
  for (const org of allOrgsMetadata) {
    const metadata = org.metadata ? JSON.parse(org.metadata) : {}
    const plan = metadata.plan || 'unknown'
    planCounts[plan] = (planCounts[plan] || 0) + 1
  }

  const recentOrganizations: RecentOrg[] = recentOrgsRaw.map((org) => {
    const metadata = org.metadata ? JSON.parse(org.metadata) : {}
    return { id: org.id, name: org.name, plan: metadata.plan || 'unknown', createdAt: org.createdAt }
  })

  return {
    totalUsers,
    totalOrganizations: totalOrgs,
    totalRevenue: Number(revenueAgg._sum.amount || 0),
    totalRevenueThisMonth: Number(revenueThisMonth._sum.amount || 0),
    activeSubscriptions: subscriptions.find((s) => s.status === 'active')?._count || 0,
    organizationsToday: orgsToday,
    organizationsThisMonth: orgsThisMonth,
    usersByPlan: Object.entries(planCounts).map(([plan, count]) => ({ plan, count })),
    recentOrganizations,
    revenueHistory: revenueRows.map((r) => ({ month: r.month, value: Number(r.value) })),
    userGrowth: userRows.map((r) => ({ month: r.month, value: Number(r.value) })),
    subscriptionsByStatus: subscriptions.map((s) => ({ status: s.status, count: s._count })),
  }
}
