import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from './rules'
import type { Action, Module, PermissionResult } from './types'

export async function checkPermission(
  action: Action,
  module: Module,
): Promise<PermissionResult> {
  // 1. Validar Sessão
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return { allowed: false, error: 'Usuário não autenticado' }
  }

  // 2. Validar Organização Ativa
  const organizationId = session.session.activeOrganizationId

  if (!organizationId) {
    return { allowed: false, error: 'Selecione uma organização para continuar' }
  }

  // 3. Buscar Vínculo com a Organização (Cacheado ou Singleton do Prisma)
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
    return { allowed: false, error: 'Você não tem acesso a esta organização' }
  }

  // 4. Validar Regra na Matriz
  const allowed = hasPermission(member.role, module, action)

  if (!allowed) {
    return { allowed: false, error: `Você não tem permissão para ${action} em ${module}` }
  }

  return {
    allowed: true,
    userId: session.user.id,
    organizationId,
    role: member.role,
    userName: session.user.name,
    userEmail: session.user.email,
  }
}
