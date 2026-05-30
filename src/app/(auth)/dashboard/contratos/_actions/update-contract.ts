'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import { type ContractInput, contractSchema } from '../_schemas/contract'

export const updateContract = withPermission(
  'update',
  'contracts',
  async (ctx, input: ContractInput & { id: string }) => {
    const { id, ...rest } = input
    const parsed = contractSchema.safeParse(rest)
    if (!parsed.success) {
      return { success: false, error: 'Dados inválidos.' }
    }

    const data = parsed.data

    try {
      const existing = await prisma.contract.findUnique({
        where: { id, organizationId: ctx.organizationId },
      })
      if (!existing) return { success: false, error: 'Contrato não encontrado.' }

      const contract = await prisma.contract.update({
        where: { id },
        data: {
          clientId: data.clientId,
          quoteId: data.quoteId || null,
          title: data.title,
          contractNumber: data.contractNumber || null,
          totalValue: data.totalValue,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          objectClause: data.objectClause || null,
          timelineClause: data.timelineClause || null,
          paymentClause: data.paymentClause || null,
          ipClause: data.ipClause || null,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        },
      })

      ctx.log({ entityId: id })
      revalidatePath('/dashboard/contratos')
      revalidatePath(`/dashboard/contratos/${id}`)

      return { success: true, data: contract }
    } catch (error) {
      console.error('[updateContract Error]', error)
      return { success: false, error: 'Erro ao atualizar contrato.' }
    }
  },
)
