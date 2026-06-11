'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { serializeQuote } from '@/lib/quote-serializer'

const ALLOWED_PUBLIC_STATUSES = ['aprovada', 'recusada'] as const
type AllowedStatus = (typeof ALLOWED_PUBLIC_STATUSES)[number]

export async function publicUpdateQuoteStatus(
  id: string,
  status: string,
  slug: string,
  signerName?: string,
) {
  if (!id || !status || !slug) {
    return { success: false, error: 'Parâmetros inválidos.' }
  }

  if (!ALLOWED_PUBLIC_STATUSES.includes(status as AllowedStatus)) {
    return { success: false, error: 'Status inválido.' }
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
      where: { id, organizationId: quote.organizationId },
      data: {
        status,
        ...(status === 'aprovada' && { approvedAt: new Date() }),
        ...(status === 'aprovada' &&
          signerName?.trim() && {
            signerName: signerName.trim(),
          }),
      },
    })

    revalidatePath(`/${slug}/proposta/${id}`)
    revalidatePath(`/dashboard/orcamentos/${id}/proposta`)
    revalidatePath(`/dashboard/orcamentos/${id}`)
    revalidatePath('/dashboard/orcamentos')

    return { success: true, data: serializeQuote(updatedQuote) }
  } catch (error) {
    console.error('[publicUpdateQuoteStatus Error]', error)
    return { success: false, error: 'Erro ao atualizar orçamento.' }
  }
}
