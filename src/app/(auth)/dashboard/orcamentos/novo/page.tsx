import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import {
  getAllFeatures,
  getFeatureById,
} from '../../catalogo/_data-access/get-features'
import { getClients } from '../../clientes/_data-access/get-clients'
import {
  type EditorFeature,
  QuoteEditorClient,
} from '../[id]/_components/quote-editor-client'

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ featureId?: string }>
}) {
  const { featureId } = await searchParams
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

  const [{ clients }, featuresData] = await Promise.all([
    getClients(activeOrgId),
    getAllFeatures(activeOrgId),
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

  let initialFeature: EditorFeature | null = null
  if (featureId) {
    const res = await getFeatureById(activeOrgId, featureId)
    if (res.success && res.feature) {
      const f = res.feature
      initialFeature = {
        id: f.id,
        nome: f.name,
        descricao: f.description || '',
        categoria: f.category?.name || 'Outro',
        baseHours: Number(f.baseHours),
        complexity: f.complexity,
        monthlyFee: Number(f.monthlyFee),
        monthlyDuration: f.monthlyDuration,
      }
    }
  }

  return (
    <QuoteEditorClient
      clients={clients || []}
      initialFeature={initialFeature}
      initialFeatures={features}
    />
  )
}
