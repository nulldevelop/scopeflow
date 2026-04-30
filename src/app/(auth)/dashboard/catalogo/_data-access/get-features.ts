import { checkPermission } from '@/lib/permissions/check-permission'
import { prisma } from '@/lib/prisma'

export async function getAllFeatures(organizationId: string) {
  return prisma.feature.findMany({
    where: { organizationId },
    include: { category: true },
    orderBy: { name: 'asc' },
  })
}

export async function getFeaturesByOrganization() {
  const session = await checkPermission('read', 'features')
  if (!session.allowed) return []
  return getAllFeatures(session.organizationId)
}
