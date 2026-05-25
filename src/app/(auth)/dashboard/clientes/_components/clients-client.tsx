'use client'

import {
  Edit2,
  FileText,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
} from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/shared/Header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteClient } from '../_actions/delete-client'
import type { ClientData } from '../_data-access/get-clients'
import { ClientModal } from './client-modal'

export function ClientsClient({
  initialClients,
}: {
  initialClients: ClientData[]
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isPending, startTransition] = useTransition()

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientData | null>(null)

  const filteredClients = initialClients.filter((client) => {
    return (
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return

    startTransition(async () => {
      try {
        const res = await deleteClient(id)
        if (res.success) {
          toast.success('Cliente excluído com sucesso!')
        } else {
          toast.error(res.error)
        }
      } catch (_error) {
        toast.error('Erro ao excluir cliente.')
      }
    })
  }

  const handleEdit = (client: ClientData) => {
    setEditingClient({
      id: client.id,
      name: client.name,
      email: client.email,
      document: client.document,
      phone: client.phone,
      totalQuotes: client.totalQuotes,
      totalApproved: client.totalApproved,
    })
    setIsModalOpen(true)
  }

  return (
    <div className="px-8 pb-12">
      <ClientModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) setEditingClient(null)
        }}
        initialData={editingClient || undefined}
      />

      <Header title="Clientes">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand text-white hover:bg-brand-dark rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo cliente
        </Button>
      </Header>

      <div className="mb-8">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            className="pl-10 bg-white border-gray-200 rounded-lg h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border border-gray-200 rounded-[14px] overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-b border-gray-100">
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 pl-6">
                Cliente
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                Contato
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                Orçamentos
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                Total Aprovado
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 text-right pr-6">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow
                key={client.id}
                className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group"
              >
                <TableCell className="pl-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-brand-light group-hover:text-brand transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-none mb-1">
                        {client.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                        {client.document || 'Sem documento'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="space-y-1">
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {client.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 text-gray-600">
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <FileText className="w-4 h-4 text-gray-300" />
                    {client.totalQuotes}
                  </div>
                </TableCell>
                <TableCell className="py-4 font-mono text-sm font-bold text-gray-900">
                  {client.totalApproved.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </TableCell>
                <TableCell className="text-right pr-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        variant="ghost"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => handleEdit(client)}
                        className="gap-2 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(client.id)}
                        className="gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredClients.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50/50 mt-8">
          <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm mb-4">
            <User className="w-6 h-6 text-gray-200" />
          </div>
          <p className="text-gray-400 font-medium">Nenhum cliente encontrado</p>
          <p className="text-xs text-gray-300">
            Tente ajustar sua busca ou crie um novo cliente
          </p>
        </div>
      )}
    </div>
  )
}
