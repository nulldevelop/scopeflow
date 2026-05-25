'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const createFeatureAction = withPermission(
  'create',
  'features',
  async (
    ctx,
    data: {
      name: string
      description?: string
      baseHours: number
      complexity?: string
      monthlyFee?: number
      monthlyDuration?: number
      categoryId?: string | null
    },
  ) => {
    try {
      const result = await prisma.feature.create({
        data: {
          name: data.name,
          description: data.description,
          baseHours: data.baseHours,
          complexity: data.complexity || 'media',
          monthlyFee: data.monthlyFee || 0,
          monthlyDuration: data.monthlyDuration || 12,
          categoryId: data.categoryId || null,
          organizationId: ctx.organizationId,
        },
      })

      revalidatePath('/dashboard/catalogo')
      return { success: true, data: result }
    } catch (error) {
      console.error('[Create Feature Error]', error)
      return { success: false, error: 'Erro ao criar funcionalidade.' }
    }
  },
)
