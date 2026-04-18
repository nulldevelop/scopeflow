'use client'

import React from 'react'
import { useScopeFlow } from '@/context/ScopeFlowContext'

interface HeaderProps {
  title: string
  children?: React.ReactNode
}

export function Header({ title, children }: HeaderProps) {
  const { user } = useScopeFlow()

  return (
    <header className="flex items-center justify-between h-16 px-8 mb-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          {title.includes('[nome]')
            ? title.replace('[nome]', user.nome.split(' ')[0])
            : title}
        </h1>
      </div>
      {children}
    </header>
  )
}
