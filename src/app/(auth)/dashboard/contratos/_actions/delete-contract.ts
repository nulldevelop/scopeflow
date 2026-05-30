'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const deleteContract = withPermission(
  'delete',
  'contracts',
  async (ctx, { id }: { id: string }) => {
    try {
      const existing = await prisma.contract.findUnique({
        where: { id, organizationId: ctx.organizationId },
      })
      if (!existing) return { success: false, error: 'Contrato não encontrado.' }

      await prisma.contract.delete({ where: { id, organizationId: ctx.organizationId } })

      ctx.log({ entityId: id })
      revalidatePath('/dashboard/contratos')

      return { success: true, data: null }
    } catch (error) {
      console.error('[deleteContract Error]', error)
      return { success: false, error: 'Erro ao excluir contrato.' }
    }
  },
)
