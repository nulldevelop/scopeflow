'use client'

import React from 'react'

interface PermissionWrapperProps {
  role: string
  allowedRoles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Wrapper simples para controle de visibilidade no Client Side.
 * Para segurança real, use withPermission em Server Actions.
 */
export function PermissionWrapper({
  role,
  allowedRoles,
  children,
  fallback = null,
}: PermissionWrapperProps) {
  const userRole = role.toLowerCase()
  const normalizedAllowed = allowedRoles.map(r => r.toLowerCase())

  const hasPermission = 
    normalizedAllowed.includes(userRole) || 
    userRole === 'owner' || 
    userRole === 'admin'

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
