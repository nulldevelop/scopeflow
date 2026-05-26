import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import type { ProjectStatus } from '@/types'
import { getAllFeatures } from '../../catalogo/_data-access/get-features'
import { getClients } from '../../clientes/_data-access/get-clients'
import { getQuoteById } from '../_data-access/get-quotes'
import {
  QuoteEditorClient,
  type EditorFeature,
  type EditorQuote,
} from './_components/quote-editor-client'

export default async function QuoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
    id !== 'novo'
      ? getQuoteById(activeOrgId, id)
      : Promise.resolve({ success: false as const, quote: null }),
  ])

  const features: EditorFeature[] = (featuresData || []).map((f) => ({
    id: f.id,
    nome: f.name,
    descricao: f.description || '',
    categoria: f.category?.name || 'Outro',
    baseHours: Number(f.baseHours),
    complexity: f.complexity,
    monthlyFee: Number(f.monthlyFee),
    monthlyDuration: f.monthlyDuration,
  }))

  let quote: EditorQuote | null = null
  if (quoteRes.success && quoteRes.quote) {
    const q = quoteRes.quote
    quote = {
      id: q.id,
      title: q.title,
      description: q.description || '',
      clientId: q.clientId || '',
      status: q.status as ProjectStatus,
      totalHours: Number(q.totalHours),
      totalValue: Number(q.totalValue),
      monthlyTotal: Number(q.monthlyTotal),
      hourlyRate: Number(q.hourlyRate),
      discount: Number(q.discount),
      urgencyFee: Number(q.urgencyFee),
      entryAmount: Number(q.entryAmount),
      installments: q.installments,
      expirationDate: q.expirationDate
        ? new Date(q.expirationDate).toISOString().split('T')[0]
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
      items: (q.items || []).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        hours: Number(item.hours),
        unitValue: Number(item.unitValue),
        monthlyFee: Number(item.monthlyFee),
        monthlyDuration: item.monthlyDuration,
        order: item.order,
        featureId: item.featureId,
      })),
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
