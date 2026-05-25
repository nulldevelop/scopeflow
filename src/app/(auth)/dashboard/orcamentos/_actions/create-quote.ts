'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions/with-permission'
import { createQuoteSchema, type CreateQuoteInput } from '../_schemas/quote'

export const createQuote = withPermission(
  'create',
  'quotes',
  async (ctx, input: CreateQuoteInput) => {
    const validatedFields = createQuoteSchema.safeParse(input)

    if (!validatedFields.success) {
      console.error('[createQuote Validation Error]', validatedFields.error.flatten().fieldErrors)
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
