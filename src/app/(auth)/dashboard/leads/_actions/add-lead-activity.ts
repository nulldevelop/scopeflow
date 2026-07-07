'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import { addLeadActivityInputSchema } from '../_schemas/lead-activity'

export const addLeadActivityAction = withPermission(
  'update',
  'leads',
  async (ctx, leadId: string, input: unknown) => {
    const parsed = addLeadActivityInputSchema.safeParse(input)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((issue) => issue.message).join(', '),
      }
    }

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, organizationId: ctx.organizationId },
    })

    if (!lead) {
      return { success: false, error: 'Lead não encontrado.' }
    }

    const activity = await prisma.leadActivity.create({
      data: { leadId, content: parsed.data.content },
    })

    ctx.log({ entityId: leadId })
    revalidatePath(`/dashboard/leads/${leadId}`)

    return {
      success: true,
      data: {
        id: activity.id,
        content: activity.content,
        createdAt: activity.createdAt.toISOString(),
      },
    }
  },
)
