'use server'

import { revalidatePath } from 'next/cache'
import { checkDomain, type DomainStatus } from '@/lib/leads/domain-check'
import { processWithDelay } from '@/lib/leads/queue'
import { calculateScore } from '@/lib/leads/scoring'
import { withPermission } from '@/lib/permissions/with-permission'
import { Prisma, prisma } from '@/lib/prisma'

const BULK_RECHECK_DELAY_MS = 1_500

export const recheckLeadDomainAction = withPermission(
  'update',
  'leads',
  async (ctx, leadId: string) => {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, organizationId: ctx.organizationId },
    })

    if (!lead) {
      return { success: false, error: 'Lead não encontrado.' }
    }

    if (!lead.website) {
      return { success: false, error: 'Este lead não tem site cadastrado.' }
    }

    try {
      const domainStatus = await checkDomain(lead.website)
      const score = calculateScore({ hasWebsite: true, domainStatus })

      await prisma.lead.update({
        where: { id: leadId },
        data: {
          hasWebsite: true,
          domainStatus: domainStatus as unknown as Prisma.InputJsonValue,
          score,
        },
      })

      ctx.log({ entityId: leadId, description: 'Reexame de domínio' })
      revalidatePath(`/dashboard/leads/${leadId}`)
      revalidatePath('/dashboard/leads')

      return { success: true, data: { score, domainStatus } as { score: number; domainStatus: DomainStatus } }
    } catch (error) {
      console.error('[recheckLeadDomainAction Error]', error)
      return { success: false, error: 'Erro ao reexaminar o site.' }
    }
  },
)

export const bulkRecheckLeadsAction = withPermission('update', 'leads', async (ctx) => {
  const leads = await prisma.lead.findMany({
    where: { organizationId: ctx.organizationId, website: { not: null } },
    select: { id: true, website: true },
  })

  if (leads.length === 0) {
    return { success: true, data: { checked: 0, failed: 0 } }
  }

  const results = await processWithDelay(leads, BULK_RECHECK_DELAY_MS, async (lead) => {
    const domainStatus = await checkDomain(lead.website as string)
    const score = calculateScore({ hasWebsite: true, domainStatus })

    await prisma.lead.update({
      where: { id: lead.id },
      data: { domainStatus: domainStatus as unknown as Prisma.InputJsonValue, score },
    })
  })

  const failed = results.filter((result) => !result.ok).length

  ctx.log({ description: `Reexame em lote: ${leads.length - failed}/${leads.length} sites` })
  revalidatePath('/dashboard/leads')

  return { success: true, data: { checked: leads.length, failed } }
})
