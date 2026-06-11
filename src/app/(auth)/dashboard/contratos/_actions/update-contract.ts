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
      if (!existing)
        return { success: false, error: 'Contrato não encontrado.' }

      // Validate that clientId belongs to this org
      if (data.clientId) {
        const client = await prisma.client.findUnique({
          where: { id: data.clientId, organizationId: ctx.organizationId },
          select: { id: true },
        })
        if (!client) return { success: false, error: 'Cliente inválido.' }
      }

      // Validate that quoteId belongs to this org
      if (data.quoteId) {
        const quote = await prisma.quote.findUnique({
          where: { id: data.quoteId, organizationId: ctx.organizationId },
          select: { id: true },
        })
        if (!quote) return { success: false, error: 'Orçamento inválido.' }
      }

      const contract = await prisma.contract.update({
        where: { id, organizationId: ctx.organizationId },
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
