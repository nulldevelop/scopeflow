'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getUserData() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })

  if (!session?.user) return null

  const organizationId = (session.session as { activeOrganizationId?: string })
    ?.activeOrganizationId

  let member = null
  if (organizationId) {
    member = await prisma.member.findFirst({
      where: { userId: session.user.id, organizationId },
      include: { organization: true },
    })
  }

  return {
    user: {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    },
    organization: member?.organization ?? null,
  }
}
