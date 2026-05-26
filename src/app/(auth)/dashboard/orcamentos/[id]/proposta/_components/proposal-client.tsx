'use client'

import { ArrowLeft, Check, Download, Link as LinkIcon, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types'
import { publicUpdateQuoteStatus } from '../../../_actions/public-quote-actions'
import { updateQuoteStatus } from '../../../_actions/update-quote-status'
import type {
  QuoteWithClient,
  SerializedQuoteItem,
} from '@/app/(auth)/dashboard/orcamentos/_components/quotes-client'

export function ProposalClient({
  quote,
  isPublic = false,
}: {
  quote: QuoteWithClient
  isPublic?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [signature, setSignature] = useState('')

  const valorParcela =
    quote.installments > 0
      ? (Number(quote.totalValue) - Number(quote.entryAmount)) /
        quote.installments
      : 0

  const handleUpdateStatus = async (status: string) => {
    if (status === 'aprovada' && !signature && isPublic) {
      setIsApproveModalOpen(true)
      return
    }

    startTransition(async () => {
      try {
        // Simple call based on the mode.
        let finalRes
        if (isPublic) {
          finalRes = await publicUpdateQuoteStatus(
            quote.id,
            status,
            signature || undefined,
          )
        } else {
          finalRes = await updateQuoteStatus({
            id: quote.id,
            status: status as ProjectStatus,
          })
        }

        if (finalRes.success) {
          toast.success(
            `Orçamento ${status === 'aprovada' ? 'aprovado' : 'recusado'}!`,
          )
          setIsApproveModalOpen(false)
          router.refresh()
        } else {
          toast.error(finalRes.error)
        }
      } catch (_error) {
        toast.error('Erro ao atualizar orçamento.')
      }
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopyLink = () => {
    const orgSlug = quote.organization?.slug || 'proposta'
    const url = `${window.location.origin}/${orgSlug}/proposta/${quote.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link da proposta copiado!')
  }

  return (
    <div className="min-h-screen bg-white pb-32 print:pb-0 print:bg-white">
      {/* Signature Dialog */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Aprovar Orçamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="signature">
                Nome do Responsável / Assinatura Digital
              </Label>
              <Input
                id="signature"
                placeholder="Digite seu nome completo"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 italic">
                Ao digitar seu nome, você concorda com os termos deste
                orçamento.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={!signature || isPending}
              onClick={() => handleUpdateStatus('aprovada')}
              className="bg-brand text-white hover:bg-brand-dark"
            >
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top Bar (Sticky) - Hidden on print */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-3 flex items-center justify-between print:hidden">
        {!isPublic ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-900 gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
              <title>Logo ScopeFlow</title>
              <rect width="60" height="60" rx="14" fill="#2A6B5C" />
              <rect x="33" y="17" width="7" height="30" rx="2" fill="white" />
            </svg>
            <span className="font-bold text-brand text-sm tracking-tight">
              ScopeFlow
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          {!isPublic && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="text-brand hover:text-brand-dark hover:bg-brand/5 gap-2 border-brand/20"
            >
              <LinkIcon className="w-4 h-4" /> Copiar Link Público
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-gray-400 hover:text-gray-900 gap-2 border-gray-200"
          >
            <Download className="w-4 h-4" /> PDF / Imprimir
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-brand-deep text-white px-8 py-16 text-center relative overflow-hidden print:bg-white print:text-gray-900 print:py-8 print:border-b print:border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(42,107,92,0.3),transparent_70%)] print:hidden" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex justify-center mb-8 print:mb-4">
            <svg
              width="48"
              height="48"
              viewBox="0 0 60 60"
              fill="none"
              className="print:w-8 print:h-8"
            >
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
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 print:text-2xl">
            {quote.title}
          </h1>
          <p className="text-brand-mid text-lg mb-4 print:text-sm print:text-gray-500">
            Proposta comercial para {quote.client?.name || 'Cliente'}
          </p>
          <div className="inline-flex items-center gap-4 text-sm text-brand-light/50 font-mono print:text-[10px] print:text-gray-400">
            <span>Ref: #{quote.id.substring(0, 8)}</span>
            <span>•</span>
            <span>
              Emitido em {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 -mt-8 relative z-20 print:mt-0 print:px-0">
        <Card className="bg-white border border-gray-100 shadow-xl rounded-[20px] overflow-hidden print:shadow-none print:border-none">
          <div className="p-8 md:p-12 print:p-0 print:pt-8">
            <div className="text-[10px] uppercase font-bold text-brand tracking-[0.2em] mb-8 print:mb-4">
              Escopo do Projeto
            </div>

            <Table className="mb-12 print:mb-8">
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
                {quote.items?.map((item: SerializedQuoteItem) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-gray-50 hover:bg-transparent"
                  >
                    <TableCell className="py-5 font-medium text-gray-900 print:py-3 print:text-xs">
                      {item.name}
                      {item.description && (
                        <p className="text-[10px] text-gray-400 font-normal mt-1 print:hidden">
                          {item.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="py-5 text-center font-mono text-sm text-gray-500 print:py-3 print:text-[10px]">
                      <div className="flex flex-col">
                        <span>{Number(item.hours)}h</span>
                        {Number(item.monthlyFee) > 0 && (
                          <span className="text-[10px] text-brand">
                            Recurrente
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-right font-mono text-gray-900 print:py-3 print:text-[10px]">
                      <div className="flex flex-col">
                        <span>
                          {Number(item.unitValue).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                        {Number(item.monthlyFee) > 0 && (
                          <span className="text-[10px] text-brand">
                            +{' '}
                            {Number(item.monthlyFee).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                            /mês
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-gray-100 print:grid-cols-2 print:gap-4 print:pt-4">
              <div className="space-y-8 print:space-y-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-brand tracking-[0.2em] mb-4 print:mb-2">
                    Condições de Pagamento
                  </div>
                  <div className="space-y-3 print:space-y-1">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg print:p-2 print:bg-white print:border">
                      <span className="text-sm text-gray-500 print:text-[10px]">
                        Entrada
                      </span>
                      <span className="font-mono font-bold text-gray-900 print:text-[10px]">
                        {Number(quote.entryAmount).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>
                    {quote.installments > 0 && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg print:p-2 print:bg-white print:border">
                        <span className="text-sm text-gray-500 print:text-[10px]">
                          {quote.installments}× Mensais
                        </span>
                        <span className="font-mono font-bold text-gray-900 print:text-[10px]">
                          {valorParcela.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-brand tracking-[0.2em] mb-4 print:mb-2">
                    Prazos & Validade
                  </div>
                  <div className="grid grid-cols-2 gap-4 print:gap-2">
                    <div className="p-3 border border-gray-100 rounded-lg print:p-2">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                        Execução
                      </p>
                      <p className="text-sm font-semibold text-gray-900 print:text-[10px]">
                        {Math.ceil(Number(quote.totalHours) / 20)} semanas
                      </p>
                    </div>
                    <div className="p-3 border border-gray-100 rounded-lg print:p-2">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                        Válido até
                      </p>
                      <p className="text-sm font-semibold text-gray-900 print:text-[10px]">
                        {quote.expirationDate
                          ? new Date(quote.expirationDate).toLocaleDateString(
                              'pt-BR',
                            )
                          : 'Sem validade'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg flex flex-col justify-center text-center md:text-right print:bg-white print:border print:p-4">
                <div className="mb-6 space-y-4">
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-400 mb-2 tracking-widest print:text-[8px]">
                      Setup do Projeto
                    </p>
                    
                    {Number(quote.discount) > 0 && (
                      <div className="mb-2 space-y-1">
                        <p className="text-sm font-mono text-gray-400 line-through">
                          {(Number(quote.totalValue) / (1 - Number(quote.discount) / 100)).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </p>
                        <p className="text-xs font-bold text-green-500 uppercase tracking-wider">
                          {quote.discount}% de Desconto aplicado
                        </p>
                      </div>
                    )}

                    <p className="text-4xl font-mono font-bold text-gray-900 mb-1 tracking-tighter print:text-2xl">
                      {Number(quote.totalValue).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Investimento único inicial
                    </p>
                  </div>
                </div>

                {Number(quote.monthlyTotal) > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-xs uppercase font-bold text-brand mb-2 tracking-widest print:text-[8px]">
                      Manutenção Mensal
                    </p>
                    <p className="text-4xl font-mono font-bold text-brand mb-1 tracking-tighter print:text-2xl">
                      {Number(quote.monthlyTotal).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-[10px] text-brand-dark/60">
                      Recurrente / Mensal
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 print:hidden">
            <p className="text-xs text-gray-400">
              Proposta gerada automaticamente pelo ScopeFlow em{' '}
              {new Date().toLocaleDateString('pt-BR')}
            </p>
            <div className="text-sm font-semibold flex items-center gap-2">
              Status atual:
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-[10px] uppercase tracking-wider',
                  quote.status === 'aprovada' && 'bg-green-100 text-green-700',
                  quote.status === 'recusada' && 'bg-red-100 text-red-700',
                  quote.status === 'rascunho' && 'bg-gray-100 text-gray-700',
                  quote.status === 'enviada' && 'bg-blue-100 text-blue-700',
                )}
              >
                {quote.status}
              </span>
            </div>
          </div>
        </Card>

        {/* Approved Stamp for Print */}
        {quote.status === 'aprovada' && (
          <div className="hidden print:block mt-8 text-center border-2 border-green-500 rounded-xl p-4 text-green-600 font-bold uppercase tracking-widest">
            Aprovado em{' '}
            {quote.approvedAt
              ? new Date(quote.approvedAt).toLocaleDateString('pt-BR')
              : new Date().toLocaleDateString('pt-BR')}
          </div>
        )}
      </div>

      {/* Floating Actions - Hidden on print */}
      {quote.status !== 'aprovada' && quote.status !== 'recusada' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => handleUpdateStatus('recusada')}
            className="rounded-full h-12 px-8 border-red-200 text-red-600 hover:bg-red-50 gap-2"
          >
            <X className="w-4 h-4" /> Recusar
          </Button>
          <Button
            disabled={isPending}
            onClick={() => handleUpdateStatus('aprovada')}
            className="rounded-full h-12 px-8 bg-brand text-white hover:bg-brand-dark gap-2 shadow-lg shadow-brand/20"
          >
            <Check className="w-4 h-4" /> Aprovar proposta
          </Button>
        </div>
      )}
    </div>
  )
}
