'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions/with-permission'
import { type UpdateLeadInput, updateLeadInputSchema } from '../_schemas/lead'

export const updateLeadAction = withPermission(
  'update',
  'leads',
  async (ctx, id: string, data: UpdateLeadInput) => {
    const validatedFields = updateLeadInputSchema.safeParse(data)

    if (!validatedFields.success) {
      return { success: false, error: 'Dados inválidos para atualizar lead.' }
    }

    const { website, ...rest } = validatedFields.data

    try {
      const result = await prisma.lead.updateMany({
        where: { id, organizationId: ctx.organizationId },
        data: {
          ...rest,
          ...(website !== undefined && {
            website: website || null,
            hasWebsite: website !== '',
          }),
        },
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
