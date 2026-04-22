import { checkPermission } from '@/lib/permissions/check-permission'
import { prisma } from '@/lib/prisma'

export async function getAllCategories(organizationId: string) {
  return prisma.category.findMany({
    where: { organizationId },
    orderBy: { name: 'asc' },
  })
}

export async function getCategoriesByOrganization() {
  const session = await checkPermission('read', 'categories')
  if (!session.allowed) return []
  return getAllCategories(session.organizationId)
}
