import { cookies } from 'next/headers'
import { getAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getSessionQuotes() {
  const cookieStore = await cookies()
  const auth = getAuth()

  const session = await auth.api.getSession({
    headers: {
      cookie: cookieStore.toString(),
    },
  })

  if (!session) return []

  const activeOrgId = (session.session as { activeOrganizationId?: string })
    .activeOrganizationId

  if (!activeOrgId) return []

  return prisma.quote.findMany({
    where: { organizationId: activeOrgId },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
}
