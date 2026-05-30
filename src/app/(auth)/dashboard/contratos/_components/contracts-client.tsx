'use client'

import {
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  FileSignature,
  LinkIcon,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { Client, Contract, Organization } from '@/generated/prisma/client'
import { cn } from '@/lib/utils'
import { deleteContract } from '../_actions/delete-contract'
import { signAndSendContract } from '../_actions/sign-contract'

type ContractStatus = 'rascunho' | 'enviado' | 'assinado' | 'cancelado'

export type ContractWithRelations = Contract & {
  client: Client | null
  organization: Pick<Organization, 'name' | 'slug' | 'logo'>
  quote: { id: string; title: string } | null
  totalValue: number
}

const statusConfig: Record<ContractStatus, { label: string; className: string }> = {
  rascunho: { label: 'Rascunho', className: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200' },
  enviado: { label: 'Enviado', className: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' },
  assinado: { label: 'Assinado', className: 'bg-green-100 text-green-700 ring-1 ring-green-200' },
  cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-700 ring-1 ring-red-200' },
}

const filterOptions: { label: string; value: ContractStatus | 'Todos' }[] = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Rascunho', value: 'rascunho' },
  { label: 'Enviado', value: 'enviado' },
  { label: 'Assinado', value: 'assinado' },
  { label: 'Cancelado', value: 'cancelado' },
]

export function ContractsClient({ contracts }: { contracts: ContractWithRelations[] }) {
  const router = useRouter()
  const [_isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'Todos'>('Todos')

  const filtered = contracts.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este contrato?')) return
    startTransition(async () => {
      const res = await deleteContract({ id })
      if (res.success) toast.success('Contrato excluído.')
      else toast.error(res.error)
    })
  }

  const handleSignAndSend = (id: string) => {
    if (!confirm('Deseja assinar e enviar este contrato? Isso irá gerar sua assinatura digital e disponibilizar o link para o cliente.')) return
    startTransition(async () => {
      const res = await signAndSendContract({ id })
      if (res.success) {
        toast.success('Contrato assinado e enviado!')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleCopyLink = (id: string, slug: string) => {
    const url = `${window.location.origin}/${slug}/contrato/${id}`
    navigator.clipboard.writeText(url)
    toast.success('Link do contrato copiado!')
  }

  return (
    <div className="px-8 -mt-14 relative z-10 pb-12">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por contrato ou cliente..."
              className="pl-10 bg-white border-gray-200 rounded-lg h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {filterOptions.map((opt) => (
              <Button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                variant={statusFilter === opt.value ? 'default' : 'outline'}
                className={cn(
                  'rounded-full text-sm font-medium transition-all whitespace-nowrap',
                  statusFilter !== opt.value && 'bg-white text-gray-600 hover:text-gray-700 hover:bg-gray-50',
                )}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <FileSignature className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'Todos'
                ? 'Nenhum contrato encontrado com esses filtros.'
                : 'Você ainda não tem contratos. Crie o primeiro!'}
            </p>
            {!searchTerm && statusFilter === 'Todos' && (
              <Button asChild className="bg-brand text-white hover:bg-brand-dark rounded-xl">
                <Link href="/dashboard/contratos/novo">
                  <Plus className="w-4 h-4 mr-2" /> Novo Contrato
                </Link>
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filtered.map((contract) => {
            const status = (contract.status as ContractStatus) || 'rascunho'
            const statusInfo = statusConfig[status] || statusConfig.rascunho

            return (
              <Card
                key={contract.id}
                className="bg-white border border-gray-200 rounded-[24px] overflow-hidden group hover:border-brand/20 hover:shadow-xl hover:shadow-brand/5 transition-all relative"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand/[0.02] to-transparent rounded-bl-full" />
                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={cn('px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold', statusInfo.className)}>
                        {statusInfo.label}
                      </span>
                      {contract.providerSigned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" /> Sua assinatura
                        </span>
                      )}
                      {contract.clientSigned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" /> Cliente assinou
                        </span>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="p-1 text-gray-400 hover:text-gray-600 transition-colors" variant="ghost">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/contratos/${contract.id}`} className="flex items-center gap-2">
                            <Edit className="w-4 h-4" /> Ver / Editar
                          </Link>
                        </DropdownMenuItem>
                        {status === 'rascunho' && (
                          <DropdownMenuItem
                            onClick={() => handleSignAndSend(contract.id)}
                            className="flex items-center gap-2 text-brand font-medium"
                          >
                            <Send className="w-4 h-4" /> Assinar e Enviar
                          </DropdownMenuItem>
                        )}
                        {(status === 'enviado' || status === 'assinado') && (
                          <DropdownMenuItem
                            onClick={() => handleCopyLink(contract.id, contract.organization.slug)}
                            className="flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4" /> Copiar Link
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(contract.id)}
                          className="flex items-center gap-2 text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand transition-colors">
                      {contract.title}
                    </h3>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-light/20 flex items-center justify-center">
                          <Users className="w-3.5 h-3.5 text-brand" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-0.5">Cliente</p>
                          <p className="font-semibold text-gray-800 leading-none">
                            {contract.client?.name || 'Cliente Removido'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-0.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-500">
                          {new Date(contract.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Valor</p>
                      <p className="text-base font-mono font-bold text-brand">
                        {Number(contract.totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Início</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {contract.startDate ? new Date(contract.startDate).toLocaleDateString('pt-BR') : '—'}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Término</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {contract.endDate ? new Date(contract.endDate).toLocaleDateString('pt-BR') : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    {contract.contractNumber && (
                      <span className="text-xs text-gray-400 font-mono">#{contract.contractNumber}</span>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      {status === 'rascunho' && (
                        <Button
                          size="sm"
                          onClick={() => handleSignAndSend(contract.id)}
                          className="bg-brand text-white hover:bg-brand-dark rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                          <Send className="w-3.5 h-3.5 mr-1.5" /> Assinar e Enviar
                        </Button>
                      )}
                      {(status === 'enviado' || status === 'assinado') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyLink(contract.id, contract.organization.slug)}
                          className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          <LinkIcon className="w-3.5 h-3.5 mr-1.5" /> Link
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        <Link href={`/dashboard/contratos/${contract.id}`}>
                          <Edit className="w-3.5 h-3.5 mr-1.5" /> Ver
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
