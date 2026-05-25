'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const createCategoryAction = withPermission(
  'create',
  'categories',
  async (ctx, name: string) => {
    try {
      const result = await prisma.category.create({
        data: {
          name,
          organizationId: ctx.organizationId,
        },
      })

      revalidatePath('/dashboard/catalogo')
      return { success: true, data: result }
    } catch (error) {
      console.error('[Create Category Error]', error)
      return { success: false, error: 'Erro ao criar categoria.' }
    }
  },
)
