'use server'

import { revalidatePath } from 'next/cache'
import { checkPlanLimit } from '@/lib/billing'
import { withPermission } from '@/lib/permissions/with-permission'
import { prisma } from '@/lib/prisma'
import { type CreateQuoteInput, createQuoteSchema } from '../_schemas/quote'

export const createQuote = withPermission(
  'create',
  'quotes',
  async (ctx, input: CreateQuoteInput) => {
    // 1. Verificar limites do plano
    const { isWithinLimits, plan } = await checkPlanLimit(ctx.organizationId)
    if (!isWithinLimits) {
      return { 
        success: false, 
        error: `Você atingiu o limite de orçamentos do seu plano ${plan.toUpperCase()}. Faça upgrade para continuar.` 
      }
    }

    const validatedFields = createQuoteSchema.safeParse(input)

    if (!validatedFields.success) {
      console.error(
        '[createQuote Validation Error]',
        validatedFields.error.flatten().fieldErrors,
      )
      return { success: false, error: 'Dados inválidos para criar orçamento.' }
    }

    const data = validatedFields.data

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

      // Serialização para o retorno (importante para Client Components que chamam a action)
      const serializedQuote = {
        ...newQuote,
        totalHours: Number(newQuote.totalHours),
        totalValue: Number(newQuote.totalValue),
        monthlyTotal: Number(newQuote.monthlyTotal),
        hourlyRate: Number(newQuote.hourlyRate),
        discount: Number(newQuote.discount),
        urgencyFee: Number(newQuote.urgencyFee),
        entryAmount: Number(newQuote.entryAmount),
      }

      return { success: true, data: serializedQuote }
    } catch (error) {
      console.error('[createQuote Error]', error)
      return { success: false, error: 'Erro ao criar orçamento.' }
    }
  },
)
