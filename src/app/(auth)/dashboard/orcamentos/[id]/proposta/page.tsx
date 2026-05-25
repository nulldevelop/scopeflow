import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import type { ProjectStatus } from '@/types'
import type { QuoteWithClient } from '../../_components/quotes-client'
import { getQuoteById } from '../../_data-access/get-quotes'
import { ProposalClient } from './_components/proposal-client'

export default async function ProposalPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  const { quote: quoteData, success } = await getQuoteById(activeOrgId, id)

  if (!success || !quoteData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Orçamento não encontrado
          </h2>
          <a
            href="/dashboard/orcamentos"
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-brand-dark"
          >
            Voltar para lista
          </a>
        </div>
      </div>
    )
  }

  // Serialização de Decimais para o Client Component
  const quote: QuoteWithClient = {
    ...quoteData,
    status: quoteData.status as ProjectStatus,
    totalHours: Number(quoteData.totalHours),
    totalValue: Number(quoteData.totalValue),
    monthlyTotal: Number(quoteData.monthlyTotal),
    hourlyRate: Number(quoteData.hourlyRate),
    discount: Number(quoteData.discount),
    urgencyFee: Number(quoteData.urgencyFee),
    entryAmount: Number(quoteData.entryAmount),
    items: quoteData.items.map((item) => {
      return {
        ...item,
        hours: Number(item.hours),
        unitValue: Number(item.unitValue),
        monthlyFee: Number(item.monthlyFee),
        monthlyDuration: item.monthlyDuration,
      }
    }),
  }

  return <ProposalClient quote={quote} />
}
