'use server'

import { revalidatePath } from 'next/cache'
import type { LeadStage } from '@/lib/prisma'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions/with-permission'
import { updateLeadInputSchema } from '../_schemas/lead'

export const updateLeadAction = withPermission(
  'update',
  'leads',
  async (ctx, id: string, data: { stage?: LeadStage; notes?: string }) => {
    const validatedFields = updateLeadInputSchema.safeParse(data)

    if (!validatedFields.success) {
      return { success: false, error: 'Dados inválidos para atualizar lead.' }
    }

    try {
      const result = await prisma.lead.updateMany({
        where: { id, organizationId: ctx.organizationId },
        data: validatedFields.data,
      })

      if (result.count === 0) {
        return { success: false, error: 'Lead não encontrado.' }
      }

      ctx.log({ entityId: id })
      revalidatePath('/dashboard/leads')
      return { success: true, data: null }
    } catch (error) {
      console.error('[updateLeadAction Error]', error)
      return { success: false, error: 'Erro ao atualizar lead.' }
    }
  },
)
