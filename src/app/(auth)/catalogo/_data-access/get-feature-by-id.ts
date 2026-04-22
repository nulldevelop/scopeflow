import { prisma } from '@/lib/prisma'

export async function getFeatureById(id: string, organizationId: string) {
  return await prisma.feature.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      category: true,
    },
  })
}
