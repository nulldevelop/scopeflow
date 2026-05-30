'use server'

import { createHash } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const signQuote = withPermission(
  'update',
  'quotes',
  async (ctx, { id }: { id: string }) => {
    try {
      const quote = await prisma.quote.findUnique({
        where: { id, organizationId: ctx.organizationId },
        select: { id: true, totalValue: true },
      })

      if (!quote) {
        return { success: false, error: 'Orçamento não encontrado.' }
      }

      const user = await prisma.user.findUnique({
        where: { id: ctx.userId },
        select: { name: true },
      })

      if (!user) {
        return { success: false, error: 'Usuário não encontrado.' }
      }

      const signedAt = new Date()
      const hashContent = `${quote.id}-${ctx.organizationId}-${ctx.userId}-${signedAt.toISOString()}-${quote.totalValue.toString()}`
      const signatureHash = createHash('sha256')
        .update(hashContent)
        .digest('hex')
        .toUpperCase()
        .slice(0, 16)

      await prisma.quote.update({
        where: { id },
        data: { signedAt, signatureHash, signerName: user.name, status: 'enviada' },
      })

      ctx.log({ entityId: id })
      revalidatePath('/dashboard/orcamentos')
      revalidatePath(`/dashboard/orcamentos/${id}`)
      revalidatePath(`/dashboard/orcamentos/${id}/proposta`)

      return { success: true, data: null }
    } catch (error) {
      console.error('[signQuote Error]', error)
      return { success: false, error: 'Erro ao assinar o orçamento.' }
    }
  },
)
