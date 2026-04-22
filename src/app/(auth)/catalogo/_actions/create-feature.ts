'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const featureSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  baseHours: z.coerce.number().min(0),
  complexity: z.string().default('media'),
  categoryId: z.string().optional().nullable(),
})

export async function createFeature(data: z.infer<typeof featureSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const organizationId = (session?.session as { activeOrganizationId?: string })
    ?.activeOrganizationId

  if (!organizationId) {
    throw new Error(
      'Você deve estar em uma organização para criar uma funcionalidade.',
    )
  }

  const result = await prisma.feature.create({
    data: {
      ...data,
      organizationId,
    },
  })

  revalidatePath('/catalogo')
  return result
}
