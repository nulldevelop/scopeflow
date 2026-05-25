import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import type { ProjectStatus } from '@/types'
import {
  QuotesClient,
  type QuoteWithClient,
} from './_components/quotes-client'
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

  if (!success || !quotesData) {
    return (
      <div className="p-8 text-center text-red-500">
        {error || 'Erro ao carregar orçamentos.'}
      </div>
    )
  }

  // Serialização de Decimais para o Client Component
  const quotes: QuoteWithClient[] = quotesData.map((quote) => {
    return {
      ...quote,
      status: quote.status as ProjectStatus,
      totalHours: Number(quote.totalHours),
      totalValue: Number(quote.totalValue),
      monthlyTotal: Number(quote.monthlyTotal),
      hourlyRate: Number(quote.hourlyRate),
      discount: Number(quote.discount),
      urgencyFee: Number(quote.urgencyFee),
      entryAmount: Number(quote.entryAmount),
      items: quote.items.map((item) => {
        return {
          ...item,
          hours: Number(item.hours),
          unitValue: Number(item.unitValue),
          monthlyFee: Number(item.monthlyFee),
          monthlyDuration: item.monthlyDuration,
        }
      }),
    }
  })

  return <QuotesClient quotes={quotes} />
}
