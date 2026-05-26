import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getSettings() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user || !session?.session?.activeOrganizationId) {
      return null
    }

    const [user, organization, subscription, billingHistory] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: session.user.id },
        }),
        prisma.organization.findUnique({
          where: { id: session.session.activeOrganizationId },
        }),
        prisma.subscription.findFirst({
          where: { organizationId: session.session.activeOrganizationId },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.billingHistory.findMany({
          where: { organizationId: session.session.activeOrganizationId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ])

    if (!user || !organization) {
      return null
    }

    const metadata = organization.metadata
      ? JSON.parse(organization.metadata)
      : {}

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        metadata: {
          profile: metadata.profile || 'fullstack',
          answers: metadata.answers || {
            taxPercentage: '6',
            workHoursDay: '6',
            workDaysMonth: '22',
            desiredSalary: '5000',
            fixedCosts: '1000',
            profitMargin: '20',
          },
          plan: metadata.plan || 'free',
        },
        subscription: subscription
          ? {
              plan: subscription.plan,
              status: subscription.status,
              currentPeriodEnd:
                subscription.currentPeriodEnd?.toISOString() || null,
            }
          : null,
        billingHistory: billingHistory.map((bh) => ({
          id: bh.id,
          amount: bh.amount.toString(),
          status: bh.status,
          createdAt: bh.createdAt.toISOString(),
        })),
      },
    }
  } catch (error) {
    console.error('[Get Settings Error]', error)
    return null
  }
}
