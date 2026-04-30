import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import { QuotesClient } from './_components/quotes-client'
import { getQuotes } from './_data-access/get-quotes'

export default async function QuotesPage() {
  const sessionResponse = await getSessionClient()

  if (!sessionResponse.success) {
    redirect('/sign-in')
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

  const { quotes, success, error } = await getQuotes(activeOrgId)

  if (!success) {
    return (
      <div className="p-8 text-center text-red-500">
        {error || 'Erro ao carregar orçamentos.'}
      </div>
    )
  }

  return <QuotesClient quotes={quotes || []} />
}
