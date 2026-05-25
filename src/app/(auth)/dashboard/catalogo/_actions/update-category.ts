'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const updateCategoryAction = withPermission(
  'update',
  'categories',
  async (_ctx, id: string, name: string) => {
    try {
      const result = await prisma.category.update({
        where: { id },
        data: { name },
      })

      revalidatePath('/dashboard/catalogo')
      return { success: true, data: result }
    } catch (error) {
      console.error('[Update Category Error]', error)
      return { success: false, error: 'Erro ao atualizar categoria.' }
    }
  },
)
