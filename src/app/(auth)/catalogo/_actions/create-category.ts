'use server'

import type { ActionResponse } from '@/lib/permissions/types'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const createCategoryAction = withPermission(
  'create',
  async (ctx, name: string): Promise<ActionResponse<unknown>> => {
    try {
      const result = await prisma.category.create({
        data: {
          name,
          organizationId: ctx.organizationId,
        },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: 'Erro ao criar categoria.' }
    }
  },
  { module: 'categories' },
)
