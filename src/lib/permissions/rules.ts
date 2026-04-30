import type { Action, Module } from './types'

// Definição clara das roles suportadas no sistema
export type UserRole = 'owner' | 'admin' | 'member'

// Matriz de Permissões: Fácil de ler e manter
const PERMISSION_MATRIX: Record<UserRole, Partial<Record<Module, Action[]>>> = {
  owner: {
    categories: ['create', 'read', 'update', 'delete', 'manage'],
    features: ['create', 'read', 'update', 'delete', 'manage'],
    quotes: ['create', 'read', 'update', 'delete', 'manage'],
    clients: ['create', 'read', 'update', 'delete', 'manage'],
    organizations: ['create', 'read', 'update', 'delete', 'manage'],
    users: ['read', 'update'],
  },
  admin: {
    categories: ['create', 'read', 'update', 'delete'],
    features: ['create', 'read', 'update', 'delete'],
    quotes: ['create', 'read', 'update', 'delete'],
    clients: ['create', 'read', 'update', 'delete'],
    organizations: ['read', 'update'],
    users: ['read', 'update'],
  },
  member: {
    categories: ['read'],
    features: ['read'],
    quotes: ['create', 'read', 'update'],
    clients: ['read'],
    organizations: ['read'],
    users: ['read', 'update'],
  },
}

export function hasPermission(role: string, module: Module, action: Action): boolean {
  const userRole = role.toLowerCase() as UserRole
  const permissions = PERMISSION_MATRIX[userRole]

  if (!permissions) return false

  const modulePermissions = permissions[module]
  if (!modulePermissions) return false

  // 'manage' é o coringa que dá acesso a tudo no módulo
  if (modulePermissions.includes('manage')) return true

  return modulePermissions.includes(action)
}
