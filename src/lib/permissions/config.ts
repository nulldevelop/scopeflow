import type { Action } from './types'

export const ROLE_PERMISSIONS: Record<string, Action[]> = {
  owner: ['create', 'read', 'update', 'delete', 'manage'],
  admin: ['create', 'read', 'update', 'delete', 'manage'],
  member: ['read', 'create', 'update'],
}

// Rotas protegidas (exemplo)
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/catalogo': ['owner', 'admin', 'member'],
  '/configuracoes': ['owner', 'admin'],
}

export type ProtectedRoute = keyof typeof ROUTE_PERMISSIONS
