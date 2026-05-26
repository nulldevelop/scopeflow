'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function publicUpdateQuoteStatus(
  id: string,
  status: string,
  _signature?: string,
) {
  if (!id || !status) {
    return { success: false, error: 'ID e status são obrigatórios.' }
  }

  try {
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: {
        status,
        approvedAt: status === 'aprovada' ? new Date() : null,
        // We could store the signature in metadata or a new field if needed
        // For now, let's just update the status
      },
      include: {
        organization: {
          select: {
            slug: true,
          },
        },
      },
    })

    revalidatePath(`/${updatedQuote.organization.slug}/proposta/${id}`)
    revalidatePath(`/dashboard/orcamentos/${id}/proposta`)
    revalidatePath('/dashboard/orcamentos')

    return { success: true, data: updatedQuote }
  } catch (error) {
    console.error('[publicUpdateQuoteStatus Error]', error)
    return { success: false, error: 'Erro ao atualizar orçamento.' }
  }
}
