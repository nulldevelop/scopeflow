'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { z } from 'zod'

const featureSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  baseHours: z.coerce.number().min(0),
  complexity: z.string().default('media'),
  categoryId: z.string().optional().nullable(),
})

export async function updateFeature(id: string, data: z.infer<typeof featureSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.session.activeOrganizationId) {
    throw new Error('Sessão expirada.')
  }

  const result = await prisma.feature.update({
    where: {
      id,
      organizationId: session.session.activeOrganizationId,
    },
    data,
  })

  revalidatePath('/catalogo')
  return result
}
