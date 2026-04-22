'use server'

import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const deleteFeatureAction = withPermission(
  'delete',
  async (ctx, id: string) => {
    await prisma.feature.delete({ where: { id } })
    return { success: true, data: undefined }
  },
  { module: 'features' },
)
