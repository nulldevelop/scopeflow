'use client'

import React from 'react'
import { usePermission } from '../hooks/use-permission'
import type { Action, Module } from '../types'

interface CanProps {
  I: Action
  a: Module
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Componente declarativo para controle de visibilidade.
 * Uso: <Can I="delete" a="features"> <Button /> </Can>
 */
export function Can({ I, a, children, fallback = null }: CanProps) {
  const { can, isPending } = usePermission()

  if (isPending) return null

  if (!can(I, a)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
