'use client'

import { useSession } from '@/lib/auth-client'
import { hasPermission } from '../rules'
import type { Action, Module } from '../types'

/**
 * Hook para verificar permissões no Client Side.
 * Utiliza a mesma matriz de regras do servidor.
 */
export function usePermission() {
  const { data: session, isPending } = useSession()

  // Enquanto carrega, não assume nenhuma permissão
  if (isPending || !session) {
    return {
      can: () => false,
      isPending,
      role: null,
      organizationId: null,
    }
  }

  // O Better-Auth coloca a role do membro na sessão quando há uma org ativa
  // Se não estiver lá, você pode precisar ajustar a tipagem ou o mapeamento
  const userRole = (session as any).member?.role || 'member'

  return {
    /**
     * Verifica se o usuário pode realizar uma ação em um módulo.
     * Ex: can('create', 'features')
     */
    can: (action: Action, module: Module) => {
      return hasPermission(userRole, module, action)
    },
    role: userRole,
    organizationId: session.session.activeOrganizationId,
    isPending: false,
  }
}
