import { getSessionClient } from '@/lib/getSession'
import { prisma } from '@/lib/prisma'

interface ClientData {
  email: string
  name: string
  totalQuotes: number
  totalApproved: number
}

export async function getSessionClients(
  _search: string,
): Promise<ClientData[]> {
  const sessionResponse = await getSessionClient()

  if (!sessionResponse.success) return []

  const { session } = sessionResponse
  const activeOrgId = session.activeOrganizationId

  if (!activeOrgId) return []

  const quotes = await prisma.quote.findMany({
    where: { organizationId: activeOrgId },
  })

  const clientMap = new Map<string, ClientData>()

  for (const quote of quotes) {
    const clientId = quote.clientId
    if (!clientId) continue

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client || !client.email) continue

    const existing = clientMap.get(client.email)
    const newClient: ClientData = existing || {
      email: client.email,
      name: client.name,
      totalQuotes: 0,
      totalApproved: 0,
    }

    newClient.totalQuotes++

    if (quote.status === 'aprovada') {
      newClient.totalApproved += Number(quote.totalValue)
    }

    clientMap.set(client.email, newClient)
  }

  return Array.from(clientMap.values())
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
