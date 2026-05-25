import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import { getClients } from '../../clientes/_data-access/get-clients'
import { getQuoteById } from '../_data-access/get-quotes'
import { getAllFeatures } from '../../catalogo/_data-access/get-features'
import { QuoteEditorClient } from './_components/quote-editor-client'

export default async function QuoteEditorPage({
  params,
}: {
  params: { id: string }
}) {
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

  const [{ clients }, featuresData, quoteRes] = await Promise.all([
    getClients(activeOrgId),
    getAllFeatures(activeOrgId),
    params.id !== 'novo' ? getQuoteById(activeOrgId, params.id) : Promise.resolve({ success: false, quote: null })
  ])

  const features = (featuresData || []).map(f => ({
    ...f,
    baseHours: Number(f.baseHours)
  }))

  let quote = null
  if (quoteRes.success && quoteRes.quote) {
    const q = quoteRes.quote
    quote = {
      ...q,
      totalHours: Number(q.totalHours),
      totalValue: Number(q.totalValue),
      hourlyRate: Number(q.hourlyRate),
      discount: Number(q.discount),
      urgencyFee: Number(q.urgencyFee),
      entryAmount: Number(q.entryAmount),
      items: (q.items || []).map(item => ({
        ...item,
        hours: Number(item.hours),
        unitValue: Number(item.unitValue)
      }))
    }
  }

  return (
    <QuoteEditorClient 
      initialQuote={quote} 
      clients={clients || []} 
      initialFeatures={features}
    />
  )
}
