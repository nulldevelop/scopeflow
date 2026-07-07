'use server'

import { revalidatePath } from 'next/cache'
import { runCollection } from '@/lib/leads/collect-leads'
import { collectPlacesInputSchema } from '@/lib/leads/places'
import { withPermission } from '@/lib/permissions/with-permission'

export const triggerCollectionAction = withPermission(
  'create',
  'leads',
  async (ctx, input: unknown) => {
    const parsed = collectPlacesInputSchema.safeParse(input)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((issue) => issue.message).join(', '),
      }
    }

    try {
      const summary = await runCollection(ctx.organizationId, parsed.data)
      ctx.log({ description: `Coleta: ${summary.found} leads encontrados` })
      revalidatePath('/dashboard/leads')
      return { success: true, data: summary }
    } catch (error) {
      console.error('[triggerCollectionAction Error]', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na coleta',
      }
    }
  },
)
