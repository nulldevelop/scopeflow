import { cookies } from 'next/headers'
import { getAuth } from '@/lib/auth'
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
  const cookieStore = await cookies()
  const auth = getAuth()

  const session = await auth.api.getSession({
    headers: {
      cookie: cookieStore.toString(),
    },
  })

  if (!session) return []

  const activeOrgId = (session.session as { activeOrganizationId?: string })
    .activeOrganizationId

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
