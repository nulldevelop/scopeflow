import { getSessionClient } from '@/lib/getSession'
import { prisma } from '@/lib/prisma'

export async function getSessionQuotes() {
  const sessionResponse = await getSessionClient()

  if (!sessionResponse.success) return []

  const { session } = sessionResponse
  const activeOrgId = session.activeOrganizationId

  if (!activeOrgId) return []

  return prisma.quote.findMany({
    where: { organizationId: activeOrgId },
    include: { client: true, items: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
}
