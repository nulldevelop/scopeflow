/** biome-ignore-all lint/suspicious/noImplicitAnyLet: dev */
'use client'

import {
  ArrowLeft,
  Check,
  CheckCircle,
  Clock,
  Link as LinkIcon,
  Printer,
  RefreshCw,
  X,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import type {
  QuoteWithClient,
  SerializedQuoteItem,
} from '@/app/(auth)/dashboard/orcamentos/_components/quotes-client'
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
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types'
import { publicUpdateQuoteStatus } from '../../../_actions/public-quote-actions'
import { signQuote } from '../../../_actions/sign-quote'
import { updateQuoteStatus } from '../../../_actions/update-quote-status'

const ProposalPDFDownload = dynamic(
  () => import('@/components/proposal-pdf/download-inner'),
  { ssr: false },
)

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

  const handleSign = async () => {
    if (
      !confirm(
        'Deseja assinar digitalmente este orçamento? Isso gerará um código de autenticidade e marcará a proposta como enviada.',
      )
    )
      return

    startTransition(async () => {
      try {
        const res = await signQuote({ id: quote.id })
        if (res.success) {
          toast.success('Orçamento assinado com sucesso!')
          router.refresh()
        } else {
          toast.error(res.error)
        }
      } catch (_error) {
        toast.error('Erro ao assinar orçamento.')
      }
    })
  }

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
            quote.organization?.slug ?? '',
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
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 px-8 py-3 flex items-center justify-between print:hidden">
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
            <>
              {!quote.signatureHash && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSign}
                  disabled={isPending}
                  className="bg-brand/5 text-brand hover:bg-brand/10 gap-2 border-brand/20 font-bold"
                >
                  <CheckCircle className="w-4 h-4" /> Assinar Proposta
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="text-brand hover:text-brand-dark hover:bg-brand/5 gap-2 border-brand/20"
              >
                <LinkIcon className="w-4 h-4" /> Copiar Link Público
              </Button>
            </>
          )}
          <ProposalPDFDownload quote={quote} />
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-gray-400 hover:text-gray-900 gap-2 border-gray-200"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-brand/90 text-white px-8 py-16 text-center relative overflow-hidden print:bg-white print:text-gray-900 print:py-8 print:border-b print:border-gray-100">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50 print:hidden" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 print:hidden" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-light/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 print:hidden" />

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
          <p className="text-white/60 text-lg mb-4 print:text-sm print:text-gray-500">
            Proposta comercial para {quote.client?.name || 'Cliente'}
          </p>
          <div className="inline-flex items-center gap-4 text-sm text-white/40 font-mono print:text-[10px] print:text-gray-400">
            <span>Ref: #{quote.id.substring(0, 8)}</span>
            <span>•</span>
            <span>
              Emitido em {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 -mt-8 relative z-20 print:mt-0 print:px-0">
        <Card className="bg-white border border-gray-100 shadow-xl rounded-[24px] overflow-hidden print:shadow-none print:border-none relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-brand/[0.02] to-transparent rounded-bl-full print:hidden" />
          <div className="relative p-8 md:p-12 print:p-0 print:pt-8">
            <div className="section-label mb-6 print:mb-4">
              Escopo do Projeto
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 print:mb-8 print:grid-cols-2 print:gap-3">
              {quote.items?.map((item: SerializedQuoteItem, index: number) => (
                <div
                  key={item.id}
                  className="group flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50/80 to-white p-5 hover:border-brand/20 hover:shadow-sm transition-all print:p-3 print:rounded-xl print:border print:bg-white"
                >
                  {/* Nome + descrição */}
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-[10px] font-black text-brand print:hidden">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 leading-snug print:text-xs">
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges: horas + valor */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 print:pt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 print:text-[10px]">
                      <Clock className="w-3.5 h-3.5 text-gray-400 print:hidden" />
                      {Number(item.hours)}h de esforço
                    </span>

                    <div className="flex flex-col items-end">
                      <span className="font-mono font-bold text-brand text-base leading-none print:text-xs">
                        {Number(item.unitValue).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                      {Number(item.monthlyFee) > 0 && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-brand/70">
                          <RefreshCw className="w-2.5 h-2.5" />
                          +{Number(item.monthlyFee).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                          /mês
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-gray-100 print:grid-cols-2 print:gap-4 print:pt-4">
              <div className="space-y-8 print:space-y-4">
                <div>
                  <div className="section-label mb-4 print:mb-2">
                    Condições de Pagamento
                  </div>
                  <div className="space-y-3 print:space-y-1">
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-2xl print:p-2 print:bg-white print:border">
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
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-2xl print:p-2 print:bg-white print:border">
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
                  <div className="section-label mb-4 print:mb-2">
                    Prazos & Validade
                  </div>
                  <div className="grid grid-cols-2 gap-4 print:gap-2">
                    <div className="p-4 border border-gray-100 rounded-2xl bg-gradient-to-br from-white to-gray-50/50 print:p-2">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                        Execução
                      </p>
                      <p className="text-sm font-semibold text-gray-900 print:text-[10px]">
                        {Math.ceil(Number(quote.totalHours) / 20)} semanas
                      </p>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-2xl bg-gradient-to-br from-white to-gray-50/50 print:p-2">
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

              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 flex flex-col justify-center text-center md:text-right print:bg-white print:border print:p-4">
                <div className="mb-6 space-y-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest print:text-[8px]">
                      Setup do Projeto
                    </p>

                    {Number(quote.discount) > 0 && (
                      <div className="mb-2 space-y-1">
                        <p className="text-sm font-mono text-gray-400 line-through">
                          {(
                            Number(quote.totalValue) /
                            (1 - Number(quote.discount) / 100)
                          ).toLocaleString('pt-BR', {
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

            {/* Signatures Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-gray-100 print:grid-cols-2 print:gap-8 print:pt-8">
              <div className="flex flex-col gap-4">
                <div className="section-label mb-2 text-gray-400">Emissor</div>
                {quote.signatureHash ? (
                  <div className="p-4 bg-brand/[0.03] border border-brand/10 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 text-brand/10">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-brand" />
                      Assinado Digitalmente
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {quote.signerName}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono mt-2">
                      AUTENTICIDADE: {quote.signatureHash}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(quote.signedAt!).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ) : (
                  <div className="h-[80px] border-b border-gray-200 border-dashed" />
                )}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {quote.organization?.slug || 'ScopeFlow'}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="section-label mb-2 text-gray-400">Cliente</div>
                {quote.status === 'aprovada' ? (
                  <div className="p-4 bg-green-50/50 border border-green-100 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 text-green-500/10">
                      <Check className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-bold text-green-700 mb-1 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      Aprovado pelo Cliente
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {quote.client?.name}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      Aceite digital em{' '}
                      {new Date(quote.updatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ) : (
                  <div className="h-[80px] border-b border-gray-200 border-dashed" />
                )}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {quote.client?.name || 'Assinatura do Cliente'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50/80 to-white px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 print:hidden">
            <p className="text-xs text-gray-400">
              Proposta gerada automaticamente pelo ScopeFlow em{' '}
              {new Date().toLocaleDateString('pt-BR')}
            </p>
            <div className="text-sm font-semibold flex items-center gap-2">
              Status atual:
              <span
                className={cn(
                  'px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold',
                  quote.status === 'aprovada' &&
                    'bg-green-100 text-green-700 ring-1 ring-green-200',
                  quote.status === 'recusada' &&
                    'bg-red-100 text-red-700 ring-1 ring-red-200',
                  quote.status === 'rascunho' &&
                    'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
                  quote.status === 'enviada' &&
                    'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
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
