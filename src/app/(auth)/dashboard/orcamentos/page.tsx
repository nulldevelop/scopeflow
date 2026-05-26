import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import type { ProjectStatus } from '@/types'
import { Header } from '@/components/shared/Header'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { QuotesClient, type QuoteWithClient } from './_components/quotes-client'
import { getQuotes } from './_data-access/get-quotes'

export const dynamic = 'force-dynamic'

export default async function QuotesPage() {
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
      signedAt: quote.signedAt,
      signatureHash: quote.signatureHash,
      signerName: quote.signerName,
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

  return (
    <div className="min-h-screen bg-[#F8F7F3]">
      <Header
        title="Orçamentos"
        subtitle="Gerencie propostas comerciais e acompanhe o status dos seus orçamentos"
        icon={FileText}
      >
        <Link
          href="/dashboard/orcamentos/novo"
          className="bg-white text-gray-900 hover:bg-gray-50 rounded-xl flex items-center gap-2 px-5 py-2.5 font-medium transition-all shadow-lg shadow-brand/10"
        >
          <Plus className="w-4 h-4" />
          Novo orçamento
        </Link>
      </Header>
      <QuotesClient quotes={quotes} />
    </div>
  )
}
