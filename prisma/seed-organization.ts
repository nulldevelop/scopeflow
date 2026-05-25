import { prisma } from '@/lib/prisma'
import { defaultCategories, defaultFeatures } from './seed-data'

export async function seedOrganization(organizationId: string) {
  console.log(`🌱 Seeding organization ${organizationId}...`)

  const categoriesMap: Record<string, string> = {}

  // 1. Create Categories
  for (const cat of defaultCategories) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        organizationId,
      },
    })
    categoriesMap[cat.name] = created.id
  }

  // 2. Create Features
  await prisma.feature.createMany({
    data: defaultFeatures.map((f) => ({
      name: f.name,
      description: f.description,
      baseHours: f.baseHours,
      complexity: f.complexity,
      categoryId: categoriesMap[f.categoryName],
      organizationId,
    })),
  })

  console.log(`✅ Seed complete for organization ${organizationId}`)
}
