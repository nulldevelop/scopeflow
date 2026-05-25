import { redirect } from 'next/navigation'
import { getPublicQuoteById } from '@/app/(auth)/dashboard/orcamentos/_data-access/get-public-quote'
import { ProposalClient } from '@/app/(auth)/dashboard/orcamentos/[id]/proposta/_components/proposal-client'

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { quote: quoteData, success } = await getPublicQuoteById(id)

  if (!success || !quoteData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center bg-gray-50">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Orçamento não encontrado
          </h2>
          <p className="text-gray-500 mb-8">
            O link que você acessou pode estar expirado ou incorreto.
          </p>
        </div>
      </div>
    )
  }

  // Serialização de Decimais para o Client Component
  const quote = {
    ...quoteData,
    totalHours: Number(quoteData.totalHours),
    totalValue: Number(quoteData.totalValue),
    hourlyRate: Number(quoteData.hourlyRate),
    discount: Number(quoteData.discount),
    urgencyFee: Number(quoteData.urgencyFee),
    entryAmount: Number(quoteData.entryAmount),
    items: (quoteData.items || []).map((item) => ({
      ...item,
      hours: Number(item.hours),
      unitValue: Number(item.unitValue),
    })),
  }

  return <ProposalClient quote={quote} isPublic={true} />
}
