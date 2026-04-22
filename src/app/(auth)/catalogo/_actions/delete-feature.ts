'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function deleteFeature(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.session.activeOrganizationId) {
    throw new Error('Sessão expirada.')
  }

  const result = await prisma.feature.delete({
    where: {
      id,
      organizationId: session.session.activeOrganizationId,
    },
  })

  revalidatePath('/catalogo')
  return result
}
