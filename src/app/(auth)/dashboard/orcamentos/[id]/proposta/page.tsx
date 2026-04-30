import { Check, Download, Share2, X } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getSessionClient } from '@/lib/getSession'
import { getQuoteById } from '../../_data-access/get-quotes'

export default async function ProposalPreviewPage({
  params,
}: {
  params: { id: string }
}) {
  const sessionResponse = await getSessionClient()

  if (!sessionResponse.success) {
    redirect('/sign-in')
  }

  const { session } = sessionResponse
  const activeOrgId = session.activeOrganizationId

  if (!activeOrgId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Nenhuma organização selecionada.
      </div>
    )
  }

  const { quote, success } = await getQuoteById(activeOrgId, params.id)

  if (!success || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Orçamento não encontrado
          </h2>
          {/* Note: O ideal seria ter um Client Component aqui para o router.push ou usar Link */}
          <a
            href="/dashboard/orcamentos"
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-brand-dark"
          >
            Voltar para lista
          </a>
        </div>
      </div>
    )
  }

  const valorParcela =
    quote.installments > 0
      ? (Number(quote.totalValue) - Number(quote.entryAmount)) /
        quote.installments
      : 0

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="bg-brand-deep text-white px-8 py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(42,107,92,0.3),transparent_70%)]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <svg width="48" height="48" viewBox="0 0 60 60" fill="none">
              <title>Logo ScopeFlow</title>
              <rect width="60" height="60" rx="14" fill="#2A6B5C" />
              <rect
                x="13"
                y="34"
                width="7"
                height="13"
                rx="2"
                fill="white"
                opacity="0.40"
              />
              <rect
                x="23"
                y="26"
                width="7"
                height="21"
                rx="2"
                fill="white"
                opacity="0.65"
              />
              <rect x="33" y="17" width="7" height="30" rx="2" fill="white" />
              <path
                d="M39 14 L46 8 M46 8 L41.5 8 M46 8 L46 12.5"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">
            {quote.title}
          </h1>
          <p className="text-brand-mid text-lg mb-4">
            Proposta comercial para {quote.client?.name || 'Cliente'}
          </p>
          <div className="inline-flex items-center gap-4 text-sm text-brand-light/50 font-mono">
            <span>Ref: #{quote.id.substring(0, 8)}</span>
            <span>•</span>
            <span>
              Emitido em {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 -mt-8 relative z-20">
        <Card className="bg-white border border-gray-100 shadow-xl rounded-[20px] overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="section-label mb-8">Escopo do Projeto</div>

            <Table className="mb-12">
              <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                    Funcionalidade
                  </TableHead>
                  <TableHead className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider text-center">
                    Esforço
                  </TableHead>
                  <TableHead className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider text-right">
                    Investimento
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.items?.map((item: any) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-gray-50 hover:bg-transparent"
                  >
                    <TableCell className="py-5 font-medium text-gray-900">
                      {item.name}
                    </TableCell>
                    <TableCell className="py-5 text-center font-mono text-sm text-gray-500">
                      {Number(item.hours)}h
                    </TableCell>
                    <TableCell className="py-5 text-right font-mono text-gray-900">
                      {Number(item.unitValue).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-gray-100">
              <div className="space-y-8">
                <div>
                  <div className="section-label mb-4">
                    Condições de Pagamento
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-500">Entrada</span>
                      <span className="font-mono font-bold text-gray-900">
                        {Number(quote.entryAmount).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-500">
                        {quote.installments}× Mensais
                      </span>
                      <span className="font-mono font-bold text-gray-900">
                        {valorParcela.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="section-label mb-4">Prazos & Validade</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-gray-100 rounded-lg">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                        Execução
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {Math.ceil(Number(quote.totalHours) / 20)} semanas
                      </p>
                    </div>
                    <div className="p-3 border border-gray-100 rounded-lg">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                        Válido até
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {quote.expirationDate
                          ? new Date(quote.expirationDate).toLocaleDateString('pt-BR')
                          : 'Sem validade'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg flex flex-col justify-center text-center md:text-right">
                <p className="text-xs uppercase font-bold text-gray-400 mb-2 tracking-widest">
                  Investimento Total
                </p>
                <p className="text-5xl font-mono font-bold text-brand mb-2 tracking-tighter">
                  {Number(quote.totalValue).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-sm text-gray-400">
                  Parcelamento em até {quote.installments + 1} meses sem juros.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Proposta gerada automaticamente pelo ScopeFlow em{' '}
              {new Date().toLocaleDateString('pt-BR')}
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-900 gap-2"
              >
                <Download className="w-4 h-4" /> PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-900 gap-2"
              >
                <Share2 className="w-4 h-4" /> Compartilhar
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Floating Actions */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full shadow-2xl z-50">
        <Button
          variant="outline"
          className="rounded-full h-12 px-8 border-danger/20 text-danger hover:bg-danger-bg gap-2"
        >
          <X className="w-4 h-4" /> Recusar
        </Button>
        <Button className="rounded-full h-12 px-8 bg-brand text-white hover:bg-brand-dark gap-2 shadow-lg shadow-brand/20">
          <Check className="w-4 h-4" /> Aprovar proposta
        </Button>
      </div>
    </div>
  )
}
