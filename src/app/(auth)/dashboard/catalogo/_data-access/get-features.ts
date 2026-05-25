import { checkPermission } from '@/lib/permissions/check-permission'
import { prisma } from '@/lib/prisma'

export async function getAllFeatures(organizationId: string) {
  return prisma.feature.findMany({
    where: { organizationId },
    include: { category: true },
    orderBy: { name: 'asc' },
  })
}

export async function getFeatureById(organizationId: string, id: string) {
  try {
    const feature = await prisma.feature.findUnique({
      where: { id, organizationId },
      include: { category: true },
    })
    return { success: true, feature }
  } catch (error) {
    console.error('[getFeatureById Error]', error)
    return { success: false, error: 'Erro ao buscar funcionalidade.' }
  }
}

export async function getFeaturesByOrganization() {
  const session = await checkPermission('read', 'features')
  if (!session.allowed) return []
  return getAllFeatures(session.organizationId)
}
