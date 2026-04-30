'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions/with-permission'
import { createClientSchema, type CreateClientInput } from '../_schemas/client'

export const createClient = withPermission(
  'create',
  'clients', // Supondo que o módulo de clientes se chame 'clients' nas permissões
  async (ctx, input: CreateClientInput) => {
    const validatedFields = createClientSchema.safeParse(input)

    if (!validatedFields.success) {
      return { success: false, error: 'Dados inválidos para criar cliente.' }
    }

    const data = validatedFields.data

    try {
      const newClient = await prisma.client.create({
        data: {
          name: data.name,
          email: data.email || null,
          document: data.document || null,
          phone: data.phone || null,
          organizationId: ctx.organizationId,
        },
      })

      ctx.log({ entityId: newClient.id })
      revalidatePath('/dashboard/clientes')
      revalidatePath('/dashboard/orcamentos')

      return { success: true, data: newClient }
    } catch (error) {
      console.error('[createClient Error]', error)
      return { success: false, error: 'Erro ao criar cliente.' }
    }
  }
)
