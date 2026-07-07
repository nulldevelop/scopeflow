'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const deleteLeadActivityAction = withPermission(
  'update',
  'leads',
  async (ctx, leadId: string, activityId: string) => {
    const result = await prisma.leadActivity.deleteMany({
      where: { id: activityId, leadId, lead: { organizationId: ctx.organizationId } },
    })

    if (result.count === 0) {
      return { success: false, error: 'Registro não encontrado.' }
    }

    ctx.log({ entityId: leadId })
    revalidatePath(`/dashboard/leads/${leadId}`)

    return { success: true, data: null }
  },
)
