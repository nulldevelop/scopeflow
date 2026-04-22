import { prisma } from '@/lib/prisma'

export async function getFeatures(organizationId: string, categoryId?: string) {
  return await prisma.feature.findMany({
    where: {
      organizationId,
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      category: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}
