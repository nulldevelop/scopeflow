'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import { serializeQuote } from '@/lib/quote-serializer'
import { type UpdateQuoteInput, updateQuoteSchema } from '../_schemas/quote'

export const updateQuote = withPermission(
  'update',
  'quotes',
  async (ctx, input: UpdateQuoteInput) => {
    const validatedFields = updateQuoteSchema.safeParse(input)
    if (!validatedFields.success) {
      console.error(
        '[updateQuote Validation Error]',
        validatedFields.error.flatten().fieldErrors,
      )
      return {
        success: false,
        error: 'Dados inválidos para atualizar orçamento.',
      }
    }

    const data = validatedFields.data

    if (!data.id) {
      return { success: false, error: 'ID do orçamento não informado.' }
    }

    if (data.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: data.clientId, organizationId: ctx.organizationId },
        select: { id: true },
      })
      if (!client) {
        return { success: false, error: 'Cliente inválido.' }
      }
    }

    try {
      const existing = await prisma.quote.findUnique({
        where: { id: data.id, organizationId: ctx.organizationId },
        select: { id: true, status: true },
      })

      if (!existing) {
        return { success: false, error: 'Orçamento não encontrado.' }
      }

      await prisma.quoteItem.deleteMany({ where: { quoteId: data.id } })

      // Only clear the provider signature when the quote is still a draft.
      // Editing a sent/signed quote must not wipe the audit trail.
      const clearSignature = existing.status === 'rascunho'

      const updatedQuote = await prisma.quote.update({
        where: { id: data.id, organizationId: ctx.organizationId },
        data: {
          title: data.title,
          description: data.description,
          clientId: data.clientId,
          status: data.status,
          totalHours: data.totalHours,
          totalValue: data.totalValue,
          monthlyTotal: data.monthlyTotal || 0,
          hourlyRate: data.hourlyRate,
          discount: data.discount,
          urgencyFee: data.urgencyFee,
          entryAmount: data.entryAmount,
          installments: data.installments,
          expirationDate: data.expirationDate,
          ...(clearSignature && {
            signedAt: null,
            signatureHash: null,
            signerName: null,
          }),
          items: {
            create: data.items.map((item, index) => ({
              name: item.name,
              description: item.description,
              hours: item.hours,
              unitValue: item.unitValue,
              monthlyFee: item.monthlyFee || 0,
              monthlyDuration: item.monthlyDuration || 12,
              order: item.order || index,
              featureId: item.featureId,
            })),
          },
        },
      })

      ctx.log({ entityId: updatedQuote.id })
      revalidatePath('/dashboard/orcamentos')
      revalidatePath(`/dashboard/orcamentos/${updatedQuote.id}`)
      revalidatePath(`/dashboard/orcamentos/${updatedQuote.id}/proposta`)

      return { success: true, data: serializeQuote(updatedQuote) }
    } catch (error) {
      console.error('[updateQuote Error]', error)
      return { success: false, error: 'Erro ao atualizar orçamento.' }
    }
  },
)
