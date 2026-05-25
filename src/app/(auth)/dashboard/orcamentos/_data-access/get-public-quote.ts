import { prisma } from '@/lib/prisma'

export async function getPublicQuoteById(id: string) {
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
            logo: true,
          },
        },
      },
    })

    if (!quote) {
      return { success: false as const, error: 'Orçamento não encontrado' }
    }

    return { success: true as const, quote }
  } catch (error) {
    console.error('[getPublicQuoteById Error]', error)
    return { success: false as const, error: 'Erro ao buscar orçamento' }
  }
}
