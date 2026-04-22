'use client'

import type React from 'react'
import { useScopeFlow } from '@/context/ScopeFlowContext'

interface HeaderProps {
  title: string
  children?: React.ReactNode
}

export function Header({ title = '', children }: HeaderProps) {
  const { user } = useScopeFlow()

  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário'

  const displayTitle = title?.includes('[nome]')
    ? title?.replace('[nome]', firstName)
    : title || ''

  return (
    <header className="flex items-center justify-between h-16 px-8 mb-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{displayTitle}</h1>
      </div>
      {children}
    </header>
  )
}
