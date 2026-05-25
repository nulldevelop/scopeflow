'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const deleteCategoryAction = withPermission(
  'delete',
  'categories',
  async (_ctx, id: string) => {
    try {
      await prisma.category.delete({ where: { id } })

      revalidatePath('/dashboard/catalogo')
      return { success: true, data: undefined }
    } catch (error) {
      console.error('[Delete Category Error]', error)
      return { success: false, error: 'Erro ao excluir categoria.' }
    }
  },
)
