import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import { getClients } from '../../clientes/_data-access/get-clients'
import { getFeatureById, getAllFeatures } from '../../catalogo/_data-access/get-features'
import { QuoteEditorClient } from '../[id]/_components/quote-editor-client'

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

  const features = (featuresData || []).map(f => ({
    ...f,
    baseHours: Number(f.baseHours)
  }))

  let initialFeature = null
  if (featureId) {
    const res = await getFeatureById(activeOrgId, featureId)
    if (res.success && res.feature) {
      initialFeature = {
        ...res.feature,
        baseHours: Number(res.feature.baseHours)
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
