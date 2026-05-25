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

  const { quotes: quotesData, success, error } = await getQuotes(activeOrgId)

  if (!success) {
    return (
      <div className="p-8 text-center text-red-500">
        {error || 'Erro ao carregar orçamentos.'}
      </div>
    )
  }

  // Serialização de Decimais para o Client Component
  const quotes = (quotesData || []).map((quote) => ({
    ...quote,
    totalHours: Number(quote.totalHours),
    totalValue: Number(quote.totalValue),
    hourlyRate: Number(quote.hourlyRate),
    discount: Number(quote.discount),
    urgencyFee: Number(quote.urgencyFee),
    entryAmount: Number(quote.entryAmount),
    items: (quote.items || []).map((item) => ({
      ...item,
      hours: Number(item.hours),
      unitValue: Number(item.unitValue),
    })),
  }))

  return <QuotesClient quotes={quotes} />
}
