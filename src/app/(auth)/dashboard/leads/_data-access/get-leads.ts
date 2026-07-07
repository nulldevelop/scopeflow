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
