import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import { ClientsClient } from './_components/clients-client'
import { getSessionClients } from './_data-access/get-clients'

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const sessionResponse = await getSessionClient()

  if (!sessionResponse.success) {
    redirect('/signin')
  }

  const { session } = sessionResponse
  const activeOrgId = session.activeOrganizationId

  if (!activeOrgId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Nenhuma organização selecionada.
      </div>
    )
  }

  const clients = await getSessionClients()

  return <ClientsClient initialClients={clients} />
}
