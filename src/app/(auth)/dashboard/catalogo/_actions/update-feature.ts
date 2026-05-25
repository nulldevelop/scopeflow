'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const updateFeatureAction = withPermission(
  'update',
  'features',
  async (
    _ctx,
    id: string,
    data: {
      name?: string
      description?: string
      baseHours?: number
      complexity?: string
      monthlyFee?: number
      monthlyDuration?: number
      categoryId?: string | null
    },
  ) => {
    try {
      const result = await prisma.feature.update({
        where: { id },
        data,
      })

      revalidatePath('/dashboard/catalogo')
      return { success: true, data: result }
    } catch (error) {
      console.error('[Update Feature Error]', error)
      return { success: false, error: 'Erro ao atualizar funcionalidade.' }
    }
  },
)
