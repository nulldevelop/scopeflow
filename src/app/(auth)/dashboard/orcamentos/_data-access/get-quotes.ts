import { prisma } from '@/lib/prisma'

export async function getQuotes(organizationId: string) {
  try {
    const quotes = await prisma.quote.findMany({
      where: {
        organizationId,
      },
      include: {
        client: true,
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { success: true as const, quotes }
  } catch (error) {
    console.error('[getQuotes Error]', error)
    return { success: false as const, error: 'Erro ao buscar orçamentos' }
  }
}

export async function getQuoteById(organizationId: string, id: string) {
  try {
    const quote = await prisma.quote.findUnique({
      where: {
        id,
        organizationId,
      },
      include: {
        client: true,
        items: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!quote) {
      return { success: false as const, error: 'Orçamento não encontrado' }
    }

    return { success: true as const, quote }
  } catch (error) {
    console.error('[getQuoteById Error]', error)
    return { success: false as const, error: 'Erro ao buscar orçamento' }
  }
}
