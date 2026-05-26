import { prisma } from '@/lib/prisma'

export async function getPublicQuoteById(id: string, slug?: string) {
  try {
    const quote = await prisma.quote.findUnique({
      where: {
        id,
      },
      include: {
        client: true,
        items: {
          orderBy: {
            order: 'asc',
          },
        },
        organization: {
          select: {
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
    })

    if (!quote) {
      return { success: false as const, error: 'Orçamento não encontrado' }
    }

    // Se um slug for fornecido, validar se bate com a organização do orçamento
    if (slug && quote.organization.slug !== slug) {
      return {
        success: false as const,
        error: 'Link inválido para esta organização',
      }
    }

    return { success: true as const, quote }
  } catch (error) {
    console.error('[getPublicQuoteById Error]', error)
    return { success: false as const, error: 'Erro ao buscar orçamento' }
  }
}
