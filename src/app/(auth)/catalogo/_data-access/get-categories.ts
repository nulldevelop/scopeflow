import { prisma } from '@/lib/prisma'
import { seedDefaultCategories } from './seed-default-categories'

export async function getCategories(organizationId: string) {
  const categories = await prisma.category.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      name: 'asc',
    },
  })

  if (categories.length === 0) {
    return await seedDefaultCategories(organizationId)
  }

  return categories
}
