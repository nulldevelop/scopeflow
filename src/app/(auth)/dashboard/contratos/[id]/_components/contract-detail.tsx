'use client'

import {
  ArrowLeft,
  Check,
  CheckCircle,
  Edit,
  FileSignature,
  LinkIcon,
  Loader2,
  Printer,
  Send,
  Trash2,
  X,
} from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { deleteContract } from '../../_actions/delete-contract'
import { signAndSendContract } from '../../_actions/sign-contract'

type ContractStatus = 'rascunho' | 'enviado' | 'assinado' | 'cancelado'

type ContractData = {
  id: string
  title: string
  contractNumber: string | null
  status: string
  totalValue: number
  startDate: Date | null
  endDate: Date | null
  objectClause: string | null
  timelineClause: string | null
  paymentClause: string | null
  ipClause: string | null
  providerSigned: boolean
  providerSignedAt: Date | null
  providerSignerName: string | null
  providerSignatureHash: string | null
  clientSigned: boolean
  clientSignedAt: Date | null
  clientSignerName: string | null
  clientSignatureHash: string | null
  sentAt: Date | null
  createdAt: Date
  client: { id: string; name: string; email: string | null; document: string | null; phone: string | null } | null
  organization: { name: string; slug: string; logo: string | null }
  quote: { id: string; title: string } | null
}

const statusConfig: Record<ContractStatus, { label: string; className: string }> = {
  rascunho: { label: 'Rascunho', className: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200' },
  enviado: { label: 'Enviado', className: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' },
  assinado: { label: 'Assinado', className: 'bg-green-100 text-green-700 ring-1 ring-green-200' },
  cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-700 ring-1 ring-red-200' },
}

function ClauseSection({ number, title, content }: { number: string; title: string; content: string | null }) {
  if (!content) return null
  return (
    <section className="mb-10 print:mb-6">
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2 print:text-xs">
        <span className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-[10px] font-black print:hidden">
          {number}
        </span>
        {number}. {title}
      </h3>
      <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 print:bg-white print:p-0 print:border-0 print:rounded-none">
        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed print:text-xs">{content}</p>
      </div>
    </section>
  )
}

export function ContractDetail({ contract, isPublic = false }: { contract: ContractData; isPublic?: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [signDialogOpen, setSignDialogOpen] = useState(false)
  const [signerName, setSignerName] = useState('')

  const status = (contract.status as ContractStatus) || 'rascunho'
  const statusInfo = statusConfig[status] || statusConfig.rascunho

  const handleSignAndSend = () => {
    if (!confirm('Deseja assinar digitalmente e disponibilizar o contrato para o cliente assinar?')) return
    startTransition(async () => {
      const res = await signAndSendContract({ id: contract.id })
      if (res.success) {
        toast.success('Contrato assinado e enviado!')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDelete = () => {
    if (!confirm('Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.')) return
    startTransition(async () => {
      const res = await deleteContract({ id: contract.id })
      if (res.success) {
        toast.success('Contrato excluído.')
        router.push('/dashboard/contratos')
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/${contract.organization.slug}/contrato/${contract.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link do contrato copiado!')
  }

  const handlePrint = () => window.print()

  return (
    <div className="min-h-screen bg-white pb-32 print:pb-0">
      {/* Top Bar */}
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
              <title>ScopeFlow</title>
              <rect width="60" height="60" rx="14" fill="#2A6B5C" />
              <rect x="33" y="17" width="7" height="30" rx="2" fill="white" />
            </svg>
            <span className="font-bold text-brand text-sm tracking-tight">ScopeFlow</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {!isPublic && (
            <>
              {status === 'rascunho' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <a href={`/dashboard/contratos/${contract.id}/editar`}>
                      <Edit className="w-4 h-4" /> Editar
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignAndSend}
                    disabled={isPending}
                    className="bg-brand/5 text-brand hover:bg-brand/10 gap-2 border-brand/20 font-bold"
                  >
                    <Send className="w-4 h-4" /> Assinar e Enviar
                  </Button>
                </>
              )}
              {(status === 'enviado' || status === 'assinado') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="text-brand hover:text-brand-dark hover:bg-brand/5 gap-2 border-brand/20"
                >
                  <LinkIcon className="w-4 h-4" /> Copiar Link
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 border-red-200"
              >
                <Trash2 className="w-4 h-4" /> Excluir
              </Button>
            </>
          )}
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

      {/* Contract Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-brand/90 text-white px-8 py-16 text-center relative overflow-hidden print:bg-white print:text-gray-900 print:py-8 print:border-b print:border-gray-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 print:hidden" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex justify-center mb-6 print:mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center ring-1 ring-white/20 print:hidden">
              <FileSignature className="w-7 h-7 text-white" />
            </div>
          </div>
          <p className="text-white/50 text-xs uppercase tracking-widest mb-2 print:text-gray-400">Contrato de Prestação de Serviços</p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 print:text-2xl print:text-gray-900">{contract.title}</h1>
          <p className="text-white/60 text-lg mb-4 print:text-sm print:text-gray-500">
            {contract.client?.name || 'Cliente'}
          </p>
          <div className="inline-flex items-center gap-4 text-sm text-white/40 font-mono print:text-[10px] print:text-gray-400">
            {contract.contractNumber && <span>#{contract.contractNumber}</span>}
            {contract.contractNumber && <span>•</span>}
            <span>Ref: {contract.id.substring(0, 8).toUpperCase()}</span>
            <span>•</span>
            <span>Emitido em {new Date(contract.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 -mt-8 relative z-20 print:mt-0 print:px-0">
        <Card className="bg-white border border-gray-100 shadow-xl rounded-[24px] overflow-hidden print:shadow-none print:border-none">
          <div className="relative p-8 md:p-12 print:p-0 print:pt-8">
            {/* Partes */}
            <section className="mb-10 print:mb-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 print:text-xs">
                Partes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 print:bg-white print:p-3 print:border">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest">Contratante</p>
                  <p className="font-bold text-gray-900">{contract.client?.name || '—'}</p>
                  {contract.client?.email && <p className="text-sm text-gray-500 mt-1">{contract.client.email}</p>}
                  {contract.client?.document && <p className="text-sm text-gray-500">Doc: {contract.client.document}</p>}
                  {contract.client?.phone && <p className="text-sm text-gray-500">{contract.client.phone}</p>}
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 print:bg-white print:p-3 print:border">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest">Contratada</p>
                  <p className="font-bold text-gray-900">{contract.organization.name}</p>
                  {contract.startDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      Início: {new Date(contract.startDate).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  {contract.endDate && (
                    <p className="text-sm text-gray-500">
                      Término: {new Date(contract.endDate).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <div className="border-t border-gray-100 my-8 print:my-4" />

            <ClauseSection number="1" title="Objeto e Escopo dos Serviços" content={contract.objectClause} />
            <ClauseSection number="2" title="Prazo de Execução" content={contract.timelineClause} />
            <ClauseSection number="3" title="Valores e Forma de Pagamento" content={contract.paymentClause} />
            <ClauseSection number="4" title="Propriedade Intelectual, Confidencialidade e Rescisão" content={contract.ipClause} />

            <div className="border-t border-gray-100 my-8 print:my-4" />

            {/* Financial Summary */}
            <div className="mb-10 flex justify-end print:mb-4">
              <div className="p-6 bg-gradient-to-br from-brand/5 to-brand/[0.02] rounded-2xl border border-brand/10 text-right print:p-3">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest">Valor Total do Contrato</p>
                <p className="text-4xl font-mono font-bold text-brand tracking-tighter print:text-2xl">
                  {Number(contract.totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-gray-100 print:grid-cols-2 print:gap-8 print:pt-8">
              {/* Provider */}
              <div className="flex flex-col gap-4">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Contratada</div>
                {contract.providerSigned ? (
                  <div className="p-4 bg-brand/[0.03] border border-brand/10 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 text-brand/10"><CheckCircle className="w-8 h-8" /></div>
                    <p className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-brand" /> Assinado Digitalmente
                    </p>
                    <p className="text-sm font-semibold text-gray-700">{contract.providerSignerName}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-2">AUTENTICIDADE: {contract.providerSignatureHash}</p>
                    {contract.providerSignedAt && (
                      <p className="text-[10px] text-gray-400">{new Date(contract.providerSignedAt).toLocaleString('pt-BR')}</p>
                    )}
                  </div>
                ) : (
                  <div className="h-[80px] border-b border-gray-200 border-dashed" />
                )}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{contract.organization.name}</p>
              </div>

              {/* Client */}
              <div className="flex flex-col gap-4">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Contratante</div>
                {contract.clientSigned ? (
                  <div className="p-4 bg-green-50/50 border border-green-100 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 text-green-500/10"><Check className="w-8 h-8" /></div>
                    <p className="text-xs font-bold text-green-700 mb-1 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600" /> Assinado pelo Cliente
                    </p>
                    <p className="text-sm font-semibold text-gray-700">{contract.clientSignerName}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-2">AUTENTICIDADE: {contract.clientSignatureHash}</p>
                    {contract.clientSignedAt && (
                      <p className="text-[10px] text-gray-400">{new Date(contract.clientSignedAt).toLocaleString('pt-BR')}</p>
                    )}
                  </div>
                ) : (
                  <div className="h-[80px] border-b border-gray-200 border-dashed" />
                )}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {contract.client?.name || 'Assinatura do Contratante'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50/80 to-white px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 print:hidden">
            <p className="text-xs text-gray-400">
              Contrato gerado pelo ScopeFlow em {new Date().toLocaleDateString('pt-BR')}
            </p>
            <div className="text-sm font-semibold flex items-center gap-2">
              Status:
              <span className={cn('px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold', statusInfo.className)}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Sign Dialog (public) */}
      <Dialog open={signDialogOpen} onOpenChange={setSignDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assinar Contrato</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="signerName">Nome do Responsável / Assinatura Digital</Label>
              <Input
                id="signerName"
                placeholder="Digite seu nome completo"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 italic">
                Ao digitar seu nome, você concorda com os termos deste contrato.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!signerName.trim() || isPending}
              onClick={async () => {
                const { publicSignContract } = await import('../../_actions/public-contract-actions')
                startTransition(async () => {
                  const res = await publicSignContract(contract.id, signerName)
                  if (res.success) {
                    toast.success('Contrato assinado com sucesso!')
                    setSignDialogOpen(false)
                    router.refresh()
                  } else {
                    toast.error(res.error)
                  }
                })
              }}
              className="bg-brand text-white hover:bg-brand-dark"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Assinatura'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Sign Bar (public only, if not yet signed) */}
      {isPublic && status === 'enviado' && !contract.clientSigned && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
          <p className="text-sm text-gray-600 font-medium hidden sm:block">Revise o contrato e assine abaixo</p>
          <Button
            onClick={() => setSignDialogOpen(true)}
            className="rounded-full h-12 px-8 bg-brand text-white hover:bg-brand-dark gap-2 shadow-lg shadow-brand/20"
          >
            <FileSignature className="w-4 h-4" /> Assinar Contrato
          </Button>
        </div>
      )}

      {/* Already signed confirmation */}
      {isPublic && status === 'assinado' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 bg-green-50/90 backdrop-blur-xl border border-green-200 rounded-full shadow-2xl z-50 print:hidden">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm font-semibold text-green-700">Contrato assinado por ambas as partes</p>
        </div>
      )}
    </div>
  )
}
