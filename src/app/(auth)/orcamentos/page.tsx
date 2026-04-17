'use client'

import React, { useState } from 'react'
import { Header } from '@/components/shared/Header'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useScopeFlow } from '@/context/ScopeFlowContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  MoreHorizontal,
  Calendar,
  Users,
  Clock,
  Layers,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ProjectStatus } from '@/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const filterOptions: { label: string; value: ProjectStatus | 'Todos' }[] = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Rascunho', value: 'rascunho' },
  { label: 'Enviada', value: 'enviada' },
  { label: 'Aprovada', value: 'aprovada' },
  { label: 'Recusada', value: 'recusada' },
]

export default function QuotesPage() {
  const { quotes } = useScopeFlow()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'Todos'>(
    'Todos',
  )

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.clienteNome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'Todos' || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="px-8 pb-12">
      <Header title="Orçamentos" />

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por projeto ou cliente..."
            className="pl-10 bg-white border-gray-200 rounded-lg h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                statusFilter === option.value
                  ? 'bg-brand text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredQuotes.map((quote) => (
          <Card
            key={quote.id}
            className="bg-white border border-gray-200 rounded-[14px] overflow-hidden group hover:border-brand/30 transition-all"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <StatusBadge status={quote.status} />
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-brand transition-colors">
                {quote.titulo}
              </h3>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {quote.clienteNome}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(quote.criadoEm).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 py-4 border-y border-gray-50 mb-6">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 mb-1">
                    Valor
                  </p>
                  <p className="text-sm font-mono font-semibold text-gray-900">
                    {quote.totalValor.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 mb-1">
                    Prazo
                  </p>
                  <p className="text-sm font-mono font-semibold text-gray-900">
                    {quote.prazoSemanas} sem.
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 mb-1">
                    Horas
                  </p>
                  <p className="text-sm font-mono font-semibold text-gray-900">
                    {quote.totalHoras}h
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 mb-1">
                    Módulos
                  </p>
                  <p className="text-sm font-mono font-semibold text-gray-900">
                    {quote.modulos}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">
                    Condições de pagamento
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    Entrada:{' '}
                    <span className="font-mono text-gray-900">
                      R$ {quote.entrada.toLocaleString('pt-BR')}
                    </span>{' '}
                    · {quote.parcelas}×{' '}
                    <span className="font-mono text-gray-900">
                      R${' '}
                      {Math.round(
                        (quote.totalValor - quote.entrada) / quote.parcelas,
                      ).toLocaleString('pt-BR')}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-lg border-gray-200 text-gray-600"
                  >
                    <Link href={`/orcamentos/${quote.id}`}>Editar</Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="bg-brand text-white hover:bg-brand-dark rounded-lg"
                  >
                    <Link href={`/orcamentos/${quote.id}/proposta`}>
                      Ver proposta
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-gray-400">
            Nenhum orçamento encontrado com esses filtros.
          </p>
        </div>
      )}
    </div>
  )
}
