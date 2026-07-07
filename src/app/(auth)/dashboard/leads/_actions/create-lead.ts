'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { checkDomain, type DomainStatus } from '@/lib/leads/domain-check'
import { calculateScore } from '@/lib/leads/scoring'
import { withPermission } from '@/lib/permissions/with-permission'
import { Prisma, prisma } from '@/lib/prisma'
import { createLeadInputSchema } from '../_schemas/lead'

export const createLeadAction = withPermission(
  'create',
  'leads',
  async (ctx, input: unknown) => {
    const parsed = createLeadInputSchema.safeParse(input)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((issue) => issue.message).join(', '),
      }
    }

    const { name, phone, address, category, website } = parsed.data
    const hasWebsite = Boolean(website)

    let domainStatus: DomainStatus | null = null
    let score = calculateScore({ hasWebsite: false, domainStatus: null })

    if (website) {
      try {
        domainStatus = await checkDomain(website)
        score = calculateScore({ hasWebsite: true, domainStatus })
      } catch (error) {
        console.error('[createLeadAction checkDomain Error]', error)
      }
    }

    try {
      const lead = await prisma.lead.create({
        data: {
          organizationId: ctx.organizationId,
          placeId: `manual/${randomUUID()}`,
          name,
          address: address || '',
          phone: phone || null,
          category: category || 'manual',
          hasWebsite,
          website: website || null,
          domainStatus: domainStatus ?? Prisma.DbNull,
          score,
        },
      })

      ctx.log({ entityId: lead.id, description: `Lead adicionado manualmente: ${name}` })
      revalidatePath('/dashboard/leads')

      return { success: true, data: { id: lead.id } }
    } catch (error) {
      console.error('[createLeadAction Error]', error)
      return { success: false, error: 'Erro ao criar lead.' }
    }
  },
)
