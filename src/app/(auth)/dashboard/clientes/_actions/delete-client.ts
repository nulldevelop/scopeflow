'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions/with-permission'

export const deleteClient = withPermission(
  'delete',
  'clients',
  async (ctx, id: string) => {
    if (!id) {
      return { success: false, error: 'ID do cliente não informado.' }
    }

    try {
      const existing = await prisma.client.findUnique({
        where: { id, organizationId: ctx.organizationId },
      })

      if (!existing) {
        return { success: false, error: 'Cliente não encontrado.' }
      }

      await prisma.client.delete({
        where: { id },
      })

      ctx.log({ entityId: id })
      revalidatePath('/dashboard/clientes')
      revalidatePath('/dashboard/orcamentos')

      return { success: true, data: null }
    } catch (error) {
      console.error('[deleteClient Error]', error)
      return { success: false, error: 'Erro ao remover cliente.' }
    }
  }
)
