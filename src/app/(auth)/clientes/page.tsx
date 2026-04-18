'use client'

import React, { useState } from 'react'
import { Header } from '@/components/shared/Header'
import { useScopeFlow } from '@/context/ScopeFlowContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Mail, Phone, MoreHorizontal, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useRouter } from 'next/navigation'

export default function ClientsPage() {
  const { quotes } = useScopeFlow()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  // Extrair clientes únicos dos orçamentos
  const clients = Array.from(
    new Map(
      quotes.map((quote) => [
        quote.clienteEmail,
        {
          nome: quote.clienteNome,
          email: quote.clienteEmail,
          totalOrcamentos: quotes.filter((q) => q.clienteEmail === quote.clienteEmail).length,
          totalInvestido: quotes
            .filter((q) => q.clienteEmail === quote.clienteEmail && q.status === 'aprovada')
            .reduce((acc, curr) => acc + curr.totalValor, 0),
        },
      ])
    ).values()
  )

  const filteredClients = clients.filter(
    (client) =>
      client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="px-8 pb-12">
      <Header title="Clientes">
        <Button
          onClick={() => router.push('/orcamentos/novo')}
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

      <Card className="border border-gray-200 rounded-[14px] overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-b border-gray-100">
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                Cliente
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                E-mail
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                Orçamentos
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                Total Aprovado
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow
                key={client.email}
                className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors"
              >
                <TableCell className="font-medium text-gray-900">
                  {client.nome}
                </TableCell>
                <TableCell className="text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-gray-400" />
                    {client.email}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                   <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 text-gray-400" />
                    {client.totalOrcamentos}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-gray-900">
                  {client.totalInvestido.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredClients.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-gray-400">
            Nenhum cliente encontrado.
          </p>
        </div>
      )}
    </div>
  )
}
