import type { Action, Module } from './types'

// Definição clara das roles suportadas no sistema
export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER'

// Matriz de Permissões: Fácil de ler e manter
const PERMISSION_MATRIX: Record<UserRole, Partial<Record<Module, Action[]>>> = {
  OWNER: {
    categories: ['create', 'read', 'update', 'delete', 'manage'],
    features: ['create', 'read', 'update', 'delete', 'manage'],
    quotes: ['create', 'read', 'update', 'delete', 'manage'],
    clients: ['create', 'read', 'update', 'delete', 'manage'],
    organizations: ['create', 'read', 'update', 'delete', 'manage'],
  },
  ADMIN: {
    categories: ['create', 'read', 'update', 'delete'],
    features: ['create', 'read', 'update', 'delete'],
    quotes: ['create', 'read', 'update', 'delete'],
    clients: ['create', 'read', 'update', 'delete'],
    organizations: ['read', 'update'],
  },
  MEMBER: {
    categories: ['read'],
    features: ['read'],
    quotes: ['create', 'read', 'update'],
    clients: ['read'],
    organizations: ['read'],
  },
}

export function hasPermission(role: string, module: Module, action: Action): boolean {
  const userRole = role.toUpperCase() as UserRole
  const permissions = PERMISSION_MATRIX[userRole]

  if (!permissions) return false

  const modulePermissions = permissions[module]
  if (!modulePermissions) return false

  // 'manage' é o coringa que dá acesso a tudo no módulo
  if (modulePermissions.includes('manage')) return true

  return modulePermissions.includes(action)
}
