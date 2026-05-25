'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import { defaultFeatures } from '../../../../../../prisma/seed-data'

export const initializeDefaultsAction = withPermission(
  'create',
  'features',
  async (ctx, { 
    selectedFeatures, 
    hourMultiplier = 1 
  }: { 
    selectedFeatures: string[], 
    hourMultiplier?: number 
  }) => {
    try {
      // 1. Get the feature data for selected names
      const featuresToImport = defaultFeatures.filter(f => selectedFeatures.includes(f.name))

      // 2. Identify and create missing categories
      const categoryNames = Array.from(new Set(featuresToImport.map(f => f.categoryName)))
      const createdCategories: Record<string, string> = {}

      for (const catName of categoryNames) {
        let category = await prisma.category.findFirst({
          where: {
            name: catName,
            organizationId: ctx.organizationId,
          },
        })

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: catName,
              organizationId: ctx.organizationId,
            },
          })
        }
        createdCategories[catName] = category.id
      }

      // 3. Create Features
      for (const f of featuresToImport) {
        const categoryId = createdCategories[f.categoryName]
        
        // Check if feature already exists
        const existingFeature = await prisma.feature.findFirst({
          where: {
            name: f.name,
            organizationId: ctx.organizationId,
          },
        })

        if (!existingFeature) {
          await prisma.feature.create({
            data: {
              name: f.name,
              description: f.description,
              baseHours: Math.round(f.baseHours * hourMultiplier * 10) / 10,
              complexity: f.complexity,
              categoryId: categoryId,
              organizationId: ctx.organizationId,
            },
          })
        }
      }

      revalidatePath('/dashboard/catalogo')
      return { success: true }
    } catch (error) {
      console.error('[Initialize Defaults Error]', error)
      return { success: false, error: 'Erro ao inicializar padrões.' }
    }
  },
)
