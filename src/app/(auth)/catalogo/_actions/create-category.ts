'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function createCategory(name: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.session.activeOrganizationId) {
    throw new Error('Sessão expirada.')
  }

  const result = await prisma.category.create({
    data: {
      name,
      organizationId: session.session.activeOrganizationId,
    },
  })

  revalidatePath('/catalogo')
  return result
}
