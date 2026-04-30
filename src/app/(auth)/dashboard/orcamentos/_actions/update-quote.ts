'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import { type UpdateQuoteInput, updateQuoteSchema } from '../_schemas/quote'

export const updateQuote = withPermission(
  'update',
  'quotes',
  async (ctx, input: UpdateQuoteInput) => {
    const validatedFields = updateQuoteSchema.safeParse(input)

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Dados inválidos para atualizar orçamento.',
      }
    }

    const data = validatedFields.data

    try {
      // Verifica se o orçamento existe e pertence à organização
      const existing = await prisma.quote.findUnique({
        where: { id: data.id, organizationId: ctx.organizationId },
      })

      if (!existing) {
        return { success: false, error: 'Orçamento não encontrado.' }
      }

      // Deleta itens antigos e cria os novos (substituição completa)
      // Numa implementação mais robusta, faríamos upsert baseado em IDs
      await prisma.quoteItem.deleteMany({
        where: { quoteId: data.id },
      })

      const updatedQuote = await prisma.quote.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          clientId: data.clientId,
          status: data.status,
          totalHours: data.totalHours,
          totalValue: data.totalValue,
          hourlyRate: data.hourlyRate,
          discount: data.discount,
          urgencyFee: data.urgencyFee,
          entryAmount: data.entryAmount,
          installments: data.installments,
          expirationDate: data.expirationDate,
          items: {
            create: data.items.map((item, index) => ({
              name: item.name,
              description: item.description,
              hours: item.hours,
              unitValue: item.unitValue,
              order: item.order || index,
              featureId: item.featureId,
            })),
          },
        },
      })

      ctx.log({ entityId: updatedQuote.id })
      revalidatePath('/dashboard/orcamentos')
      revalidatePath(`/dashboard/orcamentos/${updatedQuote.id}`)

      return { success: true, data: updatedQuote }
    } catch (error) {
      console.error('[updateQuote Error]', error)
      return { success: false, error: 'Erro ao atualizar orçamento.' }
    }
  },
)
