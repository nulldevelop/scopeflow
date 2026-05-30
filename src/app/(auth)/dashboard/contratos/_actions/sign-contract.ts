'use server'

import { createHash } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'

export const signAndSendContract = withPermission(
  'update',
  'contracts',
  async (ctx, { id }: { id: string }) => {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id, organizationId: ctx.organizationId },
      })
      if (!contract) return { success: false, error: 'Contrato não encontrado.' }
      if (contract.providerSigned) {
        return { success: false, error: 'Contrato já assinado pelo prestador.' }
      }

      const user = await prisma.user.findUnique({ where: { id: ctx.userId } })
      if (!user) return { success: false, error: 'Usuário não encontrado.' }

      const signedAt = new Date()
      const hashContent = `${contract.id}-${ctx.organizationId}-${ctx.userId}-${signedAt.toISOString()}-${contract.totalValue.toString()}`
      const hash = createHash('sha256')
        .update(hashContent)
        .digest('hex')
        .toUpperCase()
        .slice(0, 16)

      await prisma.contract.update({
        where: { id },
        data: {
          providerSigned: true,
          providerSignedAt: signedAt,
          providerSignerName: user.name,
          providerSignatureHash: hash,
          status: 'enviado',
          sentAt: signedAt,
        },
      })

      ctx.log({ entityId: id })
      revalidatePath('/dashboard/contratos')
      revalidatePath(`/dashboard/contratos/${id}`)

      return { success: true, data: null }
    } catch (error) {
      console.error('[signAndSendContract Error]', error)
      return { success: false, error: 'Erro ao assinar contrato.' }
    }
  },
)
