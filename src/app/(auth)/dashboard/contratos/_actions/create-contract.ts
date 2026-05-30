'use server'

import { revalidatePath } from 'next/cache'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import { type ContractInput, contractSchema } from '../_schemas/contract'

export const createContract = withPermission(
  'create',
  'contracts',
  async (ctx, input: ContractInput) => {
    const parsed = contractSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: 'Dados inválidos para criar contrato.' }
    }

    const data = parsed.data

    try {
      const contract = await prisma.contract.create({
        data: {
          organizationId: ctx.organizationId,
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

      ctx.log({ entityId: contract.id })
      revalidatePath('/dashboard/contratos')

      return { success: true, data: contract }
    } catch (error) {
      console.error('[createContract Error]', error)
      return { success: false, error: 'Erro ao criar contrato.' }
    }
  },
)
