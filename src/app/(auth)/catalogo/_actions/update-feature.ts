'use server'

import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const updateFeatureAction = withPermission(
  'update',
  async (
    ctx,
    id: string,
    data: {
      name?: string
      description?: string
      baseHours?: number
      complexity?: string
      categoryId?: string | null
    },
  ) => {
    const result = await prisma.feature.update({
      where: { id },
      data,
    })
    return { success: true, data: result }
  },
  { module: 'features' },
)
