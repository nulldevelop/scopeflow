'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { serializeQuote } from '@/lib/quote-serializer'

export async function publicUpdateQuoteStatus(
  id: string,
  status: string,
  slug: string,
) {
  if (!id || !status || !slug) {
    return { success: false, error: 'Parâmetros inválidos.' }
  }

  try {
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { organization: { select: { slug: true } } },
    })

    if (!quote) {
      return { success: false, error: 'Orçamento não encontrado.' }
    }

    if (quote.organization.slug !== slug) {
      return { success: false, error: 'Link inválido para esta organização.' }
    }

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: {
        status,
        approvedAt: status === 'aprovada' ? new Date() : null,
      },
    })

    revalidatePath(`/${slug}/proposta/${id}`)
    revalidatePath(`/dashboard/orcamentos/${id}/proposta`)
    revalidatePath('/dashboard/orcamentos')

    return { success: true, data: serializeQuote(updatedQuote) }
  } catch (error) {
    console.error('[publicUpdateQuoteStatus Error]', error)
    return { success: false, error: 'Erro ao atualizar orçamento.' }
  }
}
