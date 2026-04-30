'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { withPermission } from '@/lib/permissions/with-permission'
import { updateClientSchema, type UpdateClientInput } from '../_schemas/client'

export const updateClient = withPermission(
  'update',
  'clients',
  async (ctx, input: UpdateClientInput) => {
    const validatedFields = updateClientSchema.safeParse(input)

    if (!validatedFields.success) {
      return { success: false, error: 'Dados inválidos para atualizar cliente.' }
    }

    const data = validatedFields.data

    try {
      const existing = await prisma.client.findUnique({
        where: { id: data.id, organizationId: ctx.organizationId },
      })

      if (!existing) {
        return { success: false, error: 'Cliente não encontrado.' }
      }

      const updatedClient = await prisma.client.update({
        where: { id: data.id },
        data: {
          name: data.name,
          email: data.email || null,
          document: data.document || null,
          phone: data.phone || null,
        },
      })

      ctx.log({ entityId: updatedClient.id })
      revalidatePath('/dashboard/clientes')
      revalidatePath('/dashboard/orcamentos')

      return { success: true, data: updatedClient }
    } catch (error) {
      console.error('[updateClient Error]', error)
      return { success: false, error: 'Erro ao atualizar cliente.' }
    }
  }
)
