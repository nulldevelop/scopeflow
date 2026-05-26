import { redirect } from 'next/navigation'
import { getSessionClient } from '@/lib/getSession'
import { prisma } from '@/lib/prisma'
import {
  getAllFeatures,
  getFeatureById,
} from '../../catalogo/_data-access/get-features'
import { getClients } from '../../clientes/_data-access/get-clients'
import {
  type EditorFeature,
  QuoteEditorClient,
} from '../[id]/_components/quote-editor-client'

function calcHourlyRate(answers: Record<string, string | undefined>) {
  const desiredSalary = Number(answers.desiredSalary) || 0
  const fixedCosts = Number(answers.fixedCosts) || 0
  const taxPercentage = Number(answers.taxPercentage) || 0
  const profitMargin = Number(answers.profitMargin) || 0
  const workHoursDay = Number(answers.workHoursDay) || 0
  const workDaysMonth = Number(answers.workDaysMonth) || 22
  const monthlyGoal =
    (desiredSalary + fixedCosts) / (1 - (taxPercentage + profitMargin) / 100)
  const hoursPerMonth = workHoursDay * workDaysMonth
  return hoursPerMonth > 0 ? Math.ceil(monthlyGoal / hoursPerMonth) : 0
}

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

  const [org, { clients }, featuresData] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: activeOrgId },
      select: { metadata: true },
    }),
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

  const metadata = org?.metadata ? JSON.parse(org.metadata) : null
  const suggestedHourlyRate = metadata?.answers
    ? calcHourlyRate(metadata.answers)
    : undefined

  return (
    <QuoteEditorClient
      clients={clients || []}
      initialFeature={initialFeature}
      initialFeatures={features}
      suggestedHourlyRate={suggestedHourlyRate}
    />
  )
}
