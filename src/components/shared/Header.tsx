'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useScopeFlow } from '@/context/ScopeFlowContext'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { user } = useScopeFlow()
  const router = useRouter()

  return (
    <header className="flex items-center justify-between h-16 px-8 mb-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          {title.includes('[nome]')
            ? title.replace('[nome]', user.nome.split(' ')[0])
            : title}
        </h1>
      </div>
      <Button
        onClick={() => router.push('/orcamentos/novo')}
        className="bg-brand text-white hover:bg-brand-dark rounded-lg flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Novo orçamento
      </Button>
    </header>
  )
}
