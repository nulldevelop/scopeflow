import { getSessionClient } from '@/lib/getSession'
import { prisma } from '@/lib/prisma'

export interface ClientData {
  id: string
  name: string
  email: string | null
  document: string | null
  phone: string | null
  totalQuotes: number
  totalApproved: number
}

export async function getSessionClients(): Promise<ClientData[]> {
  const sessionResponse = await getSessionClient()

  if (!sessionResponse.success) return []

  const { session } = sessionResponse
  const activeOrgId = session.activeOrganizationId

  if (!activeOrgId) return []

  const clients = await prisma.client.findMany({
    where: { organizationId: activeOrgId },
    include: {
      quotes: {
        select: {
          status: true,
          totalValue: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return clients.map((client) => {
    const stats = client.quotes.reduce(
      (acc, quote) => {
        acc.totalQuotes++
        if (quote.status === 'aprovada') {
          acc.totalApproved += Number(quote.totalValue)
        }
        return acc
      },
      { totalQuotes: 0, totalApproved: 0 },
    )

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      document: client.document,
      phone: client.phone,
      totalQuotes: stats.totalQuotes,
      totalApproved: stats.totalApproved,
    }
  })
}

export async function getClients(organizationId: string) {
  try {
    const clients = await prisma.client.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        name: 'asc',
      },
    })
    return { success: true as const, clients }
  } catch (error) {
    console.error('[getClients Error]', error)
    return { success: false as const, error: 'Erro ao buscar clientes' }
  }
}

export async function getClientById(organizationId: string, id: string) {
  try {
    const client = await prisma.client.findUnique({
      where: {
        id,
        organizationId,
      },
    })

    if (!client) {
      return { success: false as const, error: 'Cliente não encontrado' }
    }

    return { success: true as const, client }
  } catch (error) {
    console.error('[getClientById Error]', error)
    return { success: false as const, error: 'Erro ao buscar cliente' }
  }
}
