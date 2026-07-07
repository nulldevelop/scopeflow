'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const deleteLeadAction = withPermission(
  'delete',
  'leads',
  async (ctx, id: string) => {
    if (!id) {
      return { success: false, error: 'ID do lead não informado.' }
    }

    try {
      const result = await prisma.lead.deleteMany({
        where: { id, organizationId: ctx.organizationId },
      })

      if (result.count === 0) {
        return { success: false, error: 'Lead não encontrado.' }
      }

      ctx.log({ entityId: id })
      revalidatePath('/dashboard/leads')

      return { success: true, data: null }
    } catch (error) {
      console.error('[deleteLeadAction Error]', error)
      return { success: false, error: 'Erro ao remover lead.' }
    }
  },
)
