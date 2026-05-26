'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const updateQuoteStatus = withPermission(
  'update',
  'quotes',
  async (ctx, { id, status }: { id: string; status: string }) => {
    if (!id || !status) {
      return { success: false, error: 'ID e status são obrigatórios.' }
    }

    try {
      const updatedQuote = await prisma.quote.update({
        where: { id, organizationId: ctx.organizationId },
        data: { status },
      })

      ctx.log({ entityId: id })
      revalidatePath('/dashboard/orcamentos')
      revalidatePath(`/dashboard/orcamentos/${id}`)
      revalidatePath(`/dashboard/orcamentos/${id}/proposta`)

      const serializedQuote = {
        ...updatedQuote,
        totalHours: Number(updatedQuote.totalHours),
        totalValue: Number(updatedQuote.totalValue),
        monthlyTotal: Number(updatedQuote.monthlyTotal),
        hourlyRate: Number(updatedQuote.hourlyRate),
        discount: Number(updatedQuote.discount),
        urgencyFee: Number(updatedQuote.urgencyFee),
        entryAmount: Number(updatedQuote.entryAmount),
      }

      return { success: true, data: serializedQuote }
    } catch (error) {
      console.error('[updateQuoteStatus Error]', error)
      return { success: false, error: 'Erro ao atualizar status do orçamento.' }
    }
  },
)
