import { notFound } from 'next/navigation'
import type { QuoteWithClient } from '@/app/(auth)/dashboard/orcamentos/_components/quotes-client'
import { getPublicQuoteById } from '@/app/(auth)/dashboard/orcamentos/_data-access/get-public-quote'
import { ProposalClient } from '@/app/(auth)/dashboard/orcamentos/[id]/proposta/_components/proposal-client'
import type { ProjectStatus } from '@/types'

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>
}) {
  const { id, slug } = await params
  const { quote: quoteData, success } = await getPublicQuoteById(id, slug)

  if (!success || !quoteData) {
    notFound()
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
    signedAt: quoteData.signedAt,
    signatureHash: quoteData.signatureHash,
    signerName: quoteData.signerName,
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

  return <ProposalClient quote={quote} isPublic={true} />
}
