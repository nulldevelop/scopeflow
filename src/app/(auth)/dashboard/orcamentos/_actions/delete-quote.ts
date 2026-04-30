'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const deleteQuote = withPermission('delete', 'quotes', async (ctx, id: string) => {
  if (!id) {
    return { success: false, error: 'ID do orçamento não informado.' }
  }

  try {
    const existing = await prisma.quote.findUnique({
      where: { id, organizationId: ctx.organizationId },
    })

    if (!existing) {
      return { success: false, error: 'Orçamento não encontrado.' }
    }

    await prisma.quote.delete({
      where: { id },
    })

    ctx.log({ entityId: id })
    revalidatePath('/dashboard/orcamentos')

    return { success: true, data: null }
  } catch (error) {
    console.error('[deleteQuote Error]', error)
    return { success: false, error: 'Erro ao remover orçamento.' }
  }
})
