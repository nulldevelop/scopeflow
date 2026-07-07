import { getSessionClient } from '@/lib/getSession'
import type { LeadStage } from '@/lib/prisma'
import { prisma } from '@/lib/prisma'

export interface LeadData {
  id: string
  placeId: string
  name: string
  address: string
  phone: string | null
  category: string
  hasWebsite: boolean
  website: string | null
  domainStatus: unknown
  score: number
  stage: LeadStage
  notes: string | null
}

export async function getSessionLeads(): Promise<LeadData[]> {
  const sessionResponse = await getSessionClient()

  if (!sessionResponse.success) return []

  const { session } = sessionResponse
  const activeOrgId = session.activeOrganizationId

  if (!activeOrgId) return []

  const leads = await prisma.lead.findMany({
    where: { organizationId: activeOrgId },
    orderBy: { score: 'desc' },
  })

  return leads
}

export interface LeadActivityData {
  id: string
  content: string
  createdAt: string
}

export interface LeadDetailData extends LeadData {
  createdAt: string
  updatedAt: string
  activities: LeadActivityData[]
}

export async function getSessionLeadById(id: string): Promise<LeadDetailData | null> {
  const sessionResponse = await getSessionClient()
  if (!sessionResponse.success) return null

  const { session } = sessionResponse
  const activeOrgId = session.activeOrganizationId
  if (!activeOrgId) return null

  const lead = await prisma.lead.findFirst({
    where: { id, organizationId: activeOrgId },
    include: { activities: { orderBy: { createdAt: 'desc' } } },
  })

  if (!lead) return null

  return {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    activities: lead.activities.map((activity) => ({
      id: activity.id,
      content: activity.content,
      createdAt: activity.createdAt.toISOString(),
    })),
  }
}
