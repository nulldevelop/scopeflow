'use server'

import { revalidatePath } from 'next/cache'
import { checkDomain, type DomainStatus } from '@/lib/leads/domain-check'
import { calculateScore } from '@/lib/leads/scoring'
import { withPermission } from '@/lib/permissions/with-permission'
import { Prisma, prisma } from '@/lib/prisma'

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
