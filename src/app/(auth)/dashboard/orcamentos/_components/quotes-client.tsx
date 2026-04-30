'use client'

import { Calendar, MoreHorizontal, Plus, Search, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Header } from '@/components/shared/Header'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { Client, Quote, QuoteItem } from '@/generated/prisma/client'
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types'

export type QuoteWithClient = Quote & {
  client: Client | null
  items: QuoteItem[]
}

const filterOptions: { label: string; value: ProjectStatus | 'Todos' }[] = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Rascunho', value: 'rascunho' },
  { label: 'Enviada', value: 'enviada' },
  { label: 'Aprovada', value: 'aprovada' },
  { label: 'Recusada', value: 'recusada' },
]

export function QuotesClient({ quotes }: { quotes: QuoteWithClient[] }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'Todos'>(
    'Todos',
  )

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.client?.name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'Todos' || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="px-8 pb-12">
      <Header title="Orçamentos">
        <Button
          onClick={() => router.push('/dashboard/orcamentos/novo')}
          className="bg-brand text-white hover:bg-brand-dark rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo orçamento
        </Button>
      </Header>

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
            <Button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              variant={statusFilter === option.value ? 'default' : 'outline'}
              className={cn(
                'rounded-full text-sm font-medium transition-all whitespace-nowrap',
                statusFilter !== option.value &&
                  'bg-white text-gray-600 hover:text-gray-700 hover:bg-gray-50',
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredQuotes.map((quote) => (
          <Card
            key={quote.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden group hover:border-brand/30 transition-all"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <StatusBadge status={quote.status as ProjectStatus} />
                <Button
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  variant="ghost"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-brand transition-colors">
                {quote.title}
              </h3>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {quote.client?.name || 'Cliente Removido'}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(quote.createdAt).toLocaleDateString('pt-BR', {
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
                    {Number(quote.totalValue).toLocaleString('pt-BR', {
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
                    N/A sem.
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 mb-1">
                    Horas
                  </p>
                  <p className="text-sm font-mono font-semibold text-gray-900">
                    {Number(quote.totalHours)}h
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 mb-1">
                    Itens
                  </p>
                  <p className="text-sm font-mono font-semibold text-gray-900">
                    {quote.items?.length || 0}
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
                      R$ {Number(quote.entryAmount).toLocaleString('pt-BR')}
                    </span>{' '}
                    · {quote.installments}×{' '}
                    <span className="font-mono text-gray-900">
                      R${' '}
                      {Math.round(
                        (Number(quote.totalValue) - Number(quote.entryAmount)) /
                          (quote.installments || 1),
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
                    <Link href={`/dashboard/orcamentos/${quote.id}`}>
                      Editar
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="bg-brand text-white hover:bg-brand-dark rounded-lg"
                  >
                    <Link href={`/dashboard/orcamentos/${quote.id}/proposta`}>
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
