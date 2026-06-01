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

const MONTH_ABBR = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

/** Buckets rows into chronological monthly series ("Mon/YY"), summing values. */
function groupByMonth<T>(
  rows: T[],
  getDate: (row: T) => Date,
  getValue: (row: T) => number,
): MonthlySeries[] {
  const buckets = new Map<
    string,
    { year: number; month: number; value: number }
  >()

  for (const row of rows) {
    const d = getDate(row)
    const year = d.getUTCFullYear()
    const month = d.getUTCMonth()
    const key = `${year}-${month}`
    const existing = buckets.get(key)
    if (existing) {
      existing.value += getValue(row)
    } else {
      buckets.set(key, { year, month, value: getValue(row) })
    }
  }

  return Array.from(buckets.values())
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((b) => ({
      month: `${MONTH_ABBR[b.month]}/${String(b.year).slice(-2)}`,
      value: b.value,
    }))
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
    recentOrgsRaw,
    allOrgsMetadata,
    billingRows,
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
    // Monthly revenue series — bucketed in JS (see groupByMonth)
    prisma.billingHistory.findMany({
      select: { amount: true, createdAt: true },
    }),
    // Monthly user-growth series — bucketed in JS (see groupByMonth)
    prisma.user.findMany({ select: { createdAt: true } }),
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
    return {
      id: org.id,
      name: org.name,
      plan: metadata.plan || 'unknown',
      createdAt: org.createdAt,
    }
  })

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
    recentOrganizations,
    revenueHistory: groupByMonth(
      billingRows,
      (r) => r.createdAt,
      (r) => Number(r.amount),
    ),
    userGrowth: groupByMonth(
      userRows,
      (r) => r.createdAt,
      () => 1,
    ),
    subscriptionsByStatus: subscriptions.map((s) => ({
      status: s.status,
      count: s._count,
    })),
  }
}
