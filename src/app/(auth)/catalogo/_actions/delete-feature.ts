'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function deleteFeature(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const organizationId = (session?.session as { activeOrganizationId?: string })
    ?.activeOrganizationId

  if (!organizationId) {
    throw new Error('Sessão expirada.')
  }

  const result = await prisma.feature.delete({
    where: {
      id,
      organizationId,
    },
  })

  revalidatePath('/catalogo')
  return result
}
