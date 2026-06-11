'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import { defaultFeatures } from '../../../../../../prisma/seed-data'

export const initializeDefaultsAction = withPermission(
  'create',
  'features',
  async (
    ctx,
    {
      selectedFeatures,
      hourMultiplier = 1,
    }: {
      selectedFeatures: string[]
      hourMultiplier?: number
    },
  ) => {
    try {
      const featuresToImport = defaultFeatures.filter((f) =>
        selectedFeatures.includes(f.name),
      )

      const categoryNames = Array.from(
        new Set(featuresToImport.map((f) => f.categoryName)),
      )

      // Fetch all existing categories in one query
      const existingCategories = await prisma.category.findMany({
        where: {
          name: { in: categoryNames },
          organizationId: ctx.organizationId,
        },
        select: { id: true, name: true },
      })

      const categoryMap: Record<string, string> = Object.fromEntries(
        existingCategories.map((c) => [c.name, c.id]),
      )

      // Create missing categories one by one (no unique constraint to use createMany with skipDuplicates)
      for (const catName of categoryNames) {
        if (!categoryMap[catName]) {
          const created = await prisma.category.create({
            data: { name: catName, organizationId: ctx.organizationId },
          })
          categoryMap[catName] = created.id
        }
      }

      // Fetch all existing features in one query
      const featureNames = featuresToImport.map((f) => f.name)
      const existingFeatures = await prisma.feature.findMany({
        where: {
          name: { in: featureNames },
          organizationId: ctx.organizationId,
        },
        select: { name: true },
      })
      const existingFeatureNames = new Set(existingFeatures.map((f) => f.name))

      // Create all missing features in one batch
      const newFeatures = featuresToImport
        .filter((f) => !existingFeatureNames.has(f.name))
        .map((f) => ({
          name: f.name,
          description: f.description,
          baseHours: Math.round(f.baseHours * hourMultiplier * 10) / 10,
          complexity: f.complexity,
          categoryId: categoryMap[f.categoryName],
          organizationId: ctx.organizationId,
        }))

      if (newFeatures.length > 0) {
        await prisma.feature.createMany({ data: newFeatures })
      }

      revalidatePath('/dashboard/catalogo')
      return { success: true, data: null }
    } catch (error) {
      console.error('[Initialize Defaults Error]', error)
      return { success: false, error: 'Erro ao inicializar padrões.' }
    }
  },
)
