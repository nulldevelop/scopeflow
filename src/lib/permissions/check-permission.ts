import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Action, Module, PermissionResult } from './types'

export async function checkPermission(
  action: Action,
  module: Module,
): Promise<PermissionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return { allowed: false, error: 'Usuário não autenticado' }
  }

  const organizationId = (session.session as { activeOrganizationId?: string })
    .activeOrganizationId

  if (!organizationId) {
    return { allowed: false, error: 'Nenhuma organização ativa' }
  }

  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId,
    },
    select: {
      role: true,
    },
  })

  if (!member) {
    return { allowed: false, error: 'Usuário não é membro desta organização' }
  }

  const role = member.role.toLowerCase()

  if (role === 'owner' || role === 'admin') {
    return {
      allowed: true,
      userId: session.user.id,
      organizationId,
      role: member.role,
      userName: session.user.name,
      userEmail: session.user.email,
    }
  }

  return { allowed: false, error: 'Sem permissão para esta ação' }
}
