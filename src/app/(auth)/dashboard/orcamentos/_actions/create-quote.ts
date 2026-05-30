'use server'

import { revalidatePath } from 'next/cache'
import { checkPlanLimit } from '@/lib/billing'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import { serializeQuote } from '@/lib/quote-serializer'
import { type CreateQuoteInput, createQuoteSchema } from '../_schemas/quote'

export const createQuote = withPermission(
  'create',
  'quotes',
  async (ctx, input: CreateQuoteInput) => {
    const { isWithinLimits, plan } = await checkPlanLimit(ctx.organizationId)
    if (!isWithinLimits) {
      return {
        success: false,
        error: `Você atingiu o limite de orçamentos do seu plano ${plan.toUpperCase()}. Faça upgrade para continuar.`,
      }
    }

    const validatedFields = createQuoteSchema.safeParse(input)
    if (!validatedFields.success) {
      console.error('[createQuote Validation Error]', validatedFields.error.flatten().fieldErrors)
      return { success: false, error: 'Dados inválidos para criar orçamento.' }
    }

    const data = validatedFields.data

    if (data.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: data.clientId, organizationId: ctx.organizationId },
        select: { id: true },
      })
      if (!client) {
        return { success: false, error: 'Cliente inválido.' }
      }
    }

    try {
      const newQuote = await prisma.quote.create({
        data: {
          title: data.title,
          description: data.description,
          organizationId: ctx.organizationId,
          clientId: data.clientId,
          totalHours: data.totalHours,
          totalValue: data.totalValue,
          monthlyTotal: data.monthlyTotal || 0,
          hourlyRate: data.hourlyRate,
          discount: data.discount,
          urgencyFee: data.urgencyFee,
          entryAmount: data.entryAmount,
          installments: data.installments,
          expirationDate: data.expirationDate,
          items: {
            create: data.items.map((item, index) => ({
              name: item.name,
              description: item.description,
              hours: item.hours,
              unitValue: item.unitValue,
              monthlyFee: item.monthlyFee || 0,
              monthlyDuration: item.monthlyDuration || 12,
              order: item.order || index,
              featureId: item.featureId,
            })),
          },
        },
      })

      ctx.log({ entityId: newQuote.id })
      revalidatePath('/dashboard/orcamentos')

      return { success: true, data: serializeQuote(newQuote) }
    } catch (error) {
      console.error('[createQuote Error]', error)
      return { success: false, error: 'Erro ao criar orçamento.' }
    }
  },
)
