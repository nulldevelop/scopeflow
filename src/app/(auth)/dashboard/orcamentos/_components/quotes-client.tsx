'use client'

import {
  Calendar,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  Edit,
  FileText,
  LinkIcon,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/shared/Header'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { Client, Quote, QuoteItem } from '@/generated/prisma/client'
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types'
import { deleteQuote } from '../_actions/delete-quote'
import { signQuote } from '../_actions/sign-quote'
import { updateQuoteStatus } from '../_actions/update-quote-status'

const QuotePDFDownload = dynamic(
  () => import('@/components/proposal-pdf/download-inner'),
  { ssr: false },
)

export type SerializedQuoteItem = Omit<
  QuoteItem,
  'hours' | 'unitValue' | 'monthlyFee'
> & {
  hours: number
  unitValue: number
  monthlyFee: number
}

export type SerializedQuote = Omit<
  Quote,
  | 'totalHours'
  | 'totalValue'
  | 'monthlyTotal'
  | 'hourlyRate'
  | 'discount'
  | 'urgencyFee'
  | 'entryAmount'
> & {
  totalHours: number
  totalValue: number
  monthlyTotal: number
  hourlyRate: number
  discount: number
  urgencyFee: number
  entryAmount: number
  status: ProjectStatus
  signedAt: Date | null
  signatureHash: string | null
  signerName: string | null
}

export type QuoteWithClient = SerializedQuote & {
  client: Client | null
  items: SerializedQuoteItem[]
  organization?: {
    name: string
    slug: string
    logo: string | null
  }
}

const filterOptions: { label: string; value: ProjectStatus | 'Todos' }[] = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Rascunho', value: 'rascunho' },
  { label: 'Enviada', value: 'enviada' },
  { label: 'Aprovada', value: 'aprovada' },
  { label: 'Recusada', value: 'recusada' },
]

const statusOptions: { label: string; value: ProjectStatus }[] = [
  { label: 'Rascunho', value: 'rascunho' },
  { label: 'Enviada', value: 'enviada' },
  { label: 'Aprovada', value: 'aprovada' },
  { label: 'Recusada', value: 'recusada' },
]

export function QuotesClient({ quotes }: { quotes: QuoteWithClient[] }) {
  const router = useRouter()
  const [_isPending, startTransition] = useTransition()
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

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return

    startTransition(async () => {
      try {
        const res = await deleteQuote(id)
        if (res.success) {
          toast.success('Orçamento excluído com sucesso!')
        } else {
          toast.error(res.error)
        }
      } catch (_error) {
        toast.error('Erro ao excluir orçamento.')
      }
    })
  }

  const handleStatusUpdate = async (id: string, status: ProjectStatus) => {
    startTransition(async () => {
      try {
        const res = await updateQuoteStatus({ id, status })
        if (res.success) {
          toast.success('Status atualizado!')
        } else {
          toast.error(res.error)
        }
      } catch (_error) {
        toast.error('Erro ao atualizar status.')
      }
    })
  }

  const handleSign = async (id: string) => {
    if (
      !confirm(
        'Deseja assinar digitalmente este orçamento? Isso marcará a proposta como enviada e gerará um código de autenticidade.',
      )
    )
      return

    startTransition(async () => {
      try {
        const res = await signQuote({ id })
        if (res.success) {
          toast.success('Orçamento assinado com sucesso!')
        } else {
          toast.error(res.error)
        }
      } catch (_error) {
        toast.error('Erro ao assinar orçamento.')
      }
    })
  }

  const handleCopyLink = (id: string, slug?: string) => {
    const orgSlug = slug || 'proposta'
    const url = `${window.location.origin}/${orgSlug}/proposta/${id}`
    navigator.clipboard.writeText(url)
    toast.success('Link da proposta copiado!')
  }

  return (
    <div className="px-8 -mt-14 relative z-10 pb-12">
      <div className="max-w-[1600px] mx-auto">
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
                  variant={
                    statusFilter === option.value ? 'default' : 'outline'
                  }
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
            {filteredQuotes.map((quote) => {
              const totalValue = Number(quote.totalValue)
              const totalHours = Number(quote.totalHours)
              const entryAmount = Number(quote.entryAmount)
              const installments = quote.installments || 1
              const installmentsValue = Math.round(
                (totalValue - entryAmount) / installments,
              )
              const prazoSemanas = Math.ceil(totalHours / 20)

              return (
                <Card
                  key={quote.id}
                  className="bg-white border border-gray-200 rounded-[24px] overflow-hidden group hover:border-brand/20 hover:shadow-xl hover:shadow-brand/5 transition-all relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand/[0.02] to-transparent rounded-bl-full" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity outline-none h-auto p-0"
                            >
                              <StatusBadge
                                status={quote.status as ProjectStatus}
                              />
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {statusOptions.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={() =>
                                  handleStatusUpdate(quote.id, option.value)
                                }
                                className={cn(
                                  'flex items-center gap-2',
                                  quote.status === option.value &&
                                    ' font-medium',
                                )}
                              >
                                <div
                                  className={cn(
                                    'w-2 h-2 rounded-full',
                                    option.value === 'rascunho' &&
                                      'bg-gray-400',
                                    option.value === 'enviada' && 'bg-blue-400',
                                    option.value === 'aprovada' &&
                                      'bg-green-400',
                                    option.value === 'recusada' && 'bg-red-400',
                                  )}
                                />
                                {option.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {quote.signatureHash && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle className="w-3 h-3" />
                            Assinado
                          </span>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            variant="ghost"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/orcamentos/${quote.id}`}
                              className="flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" /> Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/orcamentos/${quote.id}/proposta`}
                              className="flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4" /> Ver Proposta
                            </Link>
                          </DropdownMenuItem>
                          {!quote.signatureHash && (
                            <DropdownMenuItem
                              onClick={() => handleSign(quote.id)}
                              className="flex items-center gap-2 text-brand font-medium"
                            >
                              <CheckCircle className="w-4 h-4" /> Assinar
                              Proposta
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              handleCopyLink(quote.id, quote.organization?.slug)
                            }
                            className="flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4" /> Copiar Link Público
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(quote.id)}
                            className="flex items-center gap-2 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand transition-colors">
                        {quote.title}
                      </h3>
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-light/20 flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 text-brand" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-0.5">
                              Cliente
                            </p>
                            <p className="font-semibold text-gray-800 leading-none">
                              {quote.client?.name || 'Cliente Removido'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-0.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-500">
                            {new Date(quote.createdAt).toLocaleDateString(
                              'pt-BR',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 flex items-center gap-1">
                          <CreditCard className="w-3 h-3" /> Valor
                        </p>
                        <p className="text-lg font-mono font-bold text-brand">
                          {totalValue.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> Prazo
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {prazoSemanas}{' '}
                          {prazoSemanas === 1 ? 'semana' : 'semanas'}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Horas
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {totalHours}h
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 flex items-center gap-1">
                          <Package className="w-3 h-3" /> Itens
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {quote.items?.length || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          Condições de pagamento
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {entryAmount > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-green-50 to-green-50/50 text-green-700 border border-green-100">
                              <CreditCard className="w-3 h-3" />
                              Entrada: R$ {entryAmount.toLocaleString('pt-BR')}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand/5 to-brand/[0.02] text-brand border border-brand/10">
                            <CalendarDays className="w-3 h-3" />
                            {installments}x de R${' '}
                            {installmentsValue.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 sm:pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-1 sm:flex-none rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                        >
                          <Link href={`/dashboard/orcamentos/${quote.id}`}>
                            <Edit className="w-3.5 h-3.5 mr-1.5" />
                            Editar
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          asChild
                          className="flex-1 sm:flex-none bg-brand text-white hover:bg-brand-dark rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                          <Link
                            href={`/dashboard/orcamentos/${quote.id}/proposta`}
                          >
                            <FileText className="w-3.5 h-3.5 mr-1.5" />
                            Proposta
                          </Link>
                        </Button>
                        <QuotePDFDownload quote={quote} />
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {filteredQuotes.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400">
                Nenhum orçamento encontrado com esses filtros.
              </p>
            </div>
          )}
        </div>
      </div>
  )
}
