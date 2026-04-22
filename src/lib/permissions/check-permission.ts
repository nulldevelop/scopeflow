import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ROLE_PERMISSIONS } from './config'
import type { Action, PermissionResult } from './types'

export async function checkPermission(
  action: Action,
): Promise<PermissionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return { allowed: false, error: 'Usuário não autenticado' }
  }

  const organizationId = session.session.activeOrganizationId

  if (!organizationId) {
    return { allowed: false, error: 'Nenhuma organização ativa' }
  }

  // Buscar Member e Role
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

  // OWNER e ADMIN — bypass total
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

  // Verificar permissões padrão por role (config.ts)
  const allowedActions = ROLE_PERMISSIONS[role] || []
  if (allowedActions.includes(action) || allowedActions.includes('manage')) {
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
