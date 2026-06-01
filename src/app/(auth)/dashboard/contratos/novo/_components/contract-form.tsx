'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, FileSignature, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Client } from '@/generated/prisma/client'
import { createContract } from '../../_actions/create-contract'
import { updateContract } from '../../_actions/update-contract'
import { type ContractInput, contractSchema } from '../../_schemas/contract'

type QuoteOption = {
  id: string
  title: string
  totalValue: number
  totalHours: number
  installments: number
  entryAmount: number // stored as 0-100 percent
  clientId: string | null
  client: {
    name: string
    email?: string | null
    document?: string | null
  } | null
  items: {
    name: string
    description?: string | null
    hours: number
    unitValue: number
  }[]
}

export type ContractEditData = {
  id: string
  title: string
  contractNumber: string | null
  clientId: string | null
  quoteId: string | null
  totalValue: number
  startDate: Date | string | null
  endDate: Date | string | null
  objectClause: string | null
  timelineClause: string | null
  paymentClause: string | null
  ipClause: string | null
}

interface ContractFormProps {
  clients: Client[]
  quotes: QuoteOption[]
  preselectedQuote?: QuoteOption | null
  contract?: ContractEditData | null
}

function dateToInput(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function buildObjectClause(quote: QuoteOption): string {
  const itemsList = quote.items
    .map((i) => `  - ${i.name}: ${i.hours}h`)
    .join('\n')
  return `O CONTRATADO se compromete a prestar os seguintes serviços de desenvolvimento de software:\n\n${itemsList}\n\nOs serviços serão desenvolvidos conforme especificações acordadas entre as partes e descritas na proposta comercial aprovada.`
}

function isoDateToBR(isoDate: string): string {
  // Parse date-only strings without Date() to avoid UTC timezone shift
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

function buildTimelineClause(quote: QuoteOption, startDate?: string): string {
  const weeks = Math.ceil(Number(quote.totalHours) / 20)
  const start = startDate ? isoDateToBR(startDate) : '[DATA DE INÍCIO]'
  return `O prazo de execução está estimado em ${weeks} (${weeks === 1 ? 'uma semana' : `${weeks} semanas`}), com início em ${start}.\n\nOs marcos de entrega serão definidos em comum acordo e formalizados via e-mail. Alterações no escopo poderão impactar o prazo, devendo ser negociadas e documentadas entre as partes.`
}

function buildPaymentClause(quote: QuoteOption): string {
  const totalValue = Number(quote.totalValue)
  const total = totalValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
  // entryAmount is stored as a percentage (0–100)
  const entryValue = Math.round((totalValue * Number(quote.entryAmount)) / 100)
  const remaining = totalValue - entryValue
  const installmentValue =
    quote.installments > 0 ? remaining / quote.installments : remaining
  let text = `O valor total dos serviços é de ${total}, a ser pago da seguinte forma:\n\n`
  if (entryValue > 0) {
    text += `• Entrada: ${entryValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} no ato da assinatura deste contrato.\n`
  }
  if (quote.installments > 0) {
    text += `• ${quote.installments}x parcela(s) de ${installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} após início dos trabalhos.\n`
  }
  text += `\nEm caso de atraso no pagamento, incidirá multa de 2% sobre o valor em aberto, acrescida de juros de 1% ao mês. O não pagamento por mais de 30 dias poderá resultar na suspensão dos serviços.`
  return text
}

const defaultIpClause = `PROPRIEDADE INTELECTUAL: Todos os direitos sobre o software desenvolvido serão transferidos ao CONTRATANTE após o pagamento integral dos valores acordados. Até a quitação total, o código-fonte permanece de propriedade do CONTRATADO.

CONFIDENCIALIDADE: As partes se comprometem a manter sigilo sobre informações confidenciais compartilhadas durante a execução do contrato, pelo prazo de 2 (dois) anos após o término.

RESCISÃO: Este contrato poderá ser rescindido por qualquer das partes mediante notificação escrita com antecedência mínima de 30 (trinta) dias. Em caso de rescisão unilateral imotivada, a parte inadimplente ficará sujeita a multa equivalente a 20% do valor total do contrato.

FORO: Fica eleito o foro da comarca onde reside o CONTRATADO para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.`

export function ContractForm({
  clients,
  quotes,
  preselectedQuote,
  contract,
}: ContractFormProps) {
  const router = useRouter()
  const isEditing = !!contract

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContractInput>({
    resolver: zodResolver(contractSchema),
    defaultValues: contract
      ? {
          title: contract.title,
          contractNumber: contract.contractNumber ?? '',
          clientId: contract.clientId ?? '',
          quoteId: contract.quoteId ?? '',
          totalValue: Number(contract.totalValue),
          startDate: dateToInput(contract.startDate),
          endDate: dateToInput(contract.endDate),
          objectClause: contract.objectClause ?? '',
          timelineClause: contract.timelineClause ?? '',
          paymentClause: contract.paymentClause ?? '',
          ipClause: contract.ipClause ?? '',
        }
      : {
          title: preselectedQuote ? `Contrato – ${preselectedQuote.title}` : '',
          clientId: preselectedQuote?.clientId ?? '',
          quoteId: preselectedQuote?.id ?? '',
          totalValue: preselectedQuote
            ? Number(preselectedQuote.totalValue)
            : 0,
          objectClause: preselectedQuote
            ? buildObjectClause(preselectedQuote)
            : '',
          timelineClause: preselectedQuote
            ? buildTimelineClause(preselectedQuote)
            : '',
          paymentClause: preselectedQuote
            ? buildPaymentClause(preselectedQuote)
            : '',
          ipClause: defaultIpClause,
        },
  })

  const selectedQuoteId = watch('quoteId')

  // Auto-fill form fields when user picks a quote from the dropdown.
  // Skipped in edit mode to avoid overwriting existing clauses.
  useEffect(() => {
    if (isEditing) return
    if (!selectedQuoteId) return
    const q = quotes.find((q) => q.id === selectedQuoteId)
    if (!q) return
    setValue('title', `Contrato – ${q.title}`)
    setValue('totalValue', Number(q.totalValue))
    if (q.clientId) setValue('clientId', q.clientId)
    setValue('objectClause', buildObjectClause(q))
    setValue('timelineClause', buildTimelineClause(q))
    setValue('paymentClause', buildPaymentClause(q))
  }, [selectedQuoteId, quotes, setValue, isEditing])

  const onSubmit = async (data: ContractInput) => {
    if (contract) {
      const res = await updateContract({ ...data, id: contract.id })
      if (res.success) {
        toast.success('Contrato atualizado com sucesso!')
        router.push(`/dashboard/contratos/${contract.id}`)
      } else {
        toast.error(res.error)
      }
      return
    }

    const res = await createContract(data)
    if (res.success) {
      toast.success('Contrato criado com sucesso!')
      router.push(`/dashboard/contratos/${res.data.id}`)
    } else {
      toast.error(res.error)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] pb-16">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-brand/90 px-8 pt-16 pb-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
              <FileSignature className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                {isEditing ? 'Editar Contrato' : 'Novo Contrato'}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                Preencha os campos e personalize as cláusulas
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 -mt-14 relative z-10">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <Card className="bg-white border border-gray-200 rounded-[24px] p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-xs font-black">
                  1
                </span>
                Informações Básicas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="title">Título do Contrato *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Contrato de Desenvolvimento – Sistema ERP"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contractNumber">
                    Número do Contrato (opcional)
                  </Label>
                  <Input
                    id="contractNumber"
                    placeholder="Ex: 2025-001"
                    {...register('contractNumber')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="totalValue">Valor Total (R$) *</Label>
                  <Input
                    id="totalValue"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('totalValue', { valueAsNumber: true })}
                  />
                  {errors.totalValue && (
                    <p className="text-red-500 text-xs">
                      {errors.totalValue.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="clientId">Cliente *</Label>
                  <select
                    id="clientId"
                    {...register('clientId')}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && (
                    <p className="text-red-500 text-xs">
                      {errors.clientId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="quoteId">
                    Vincular Orçamento Aprovado (opcional)
                  </Label>
                  <select
                    id="quoteId"
                    {...register('quoteId')}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Nenhum</option>
                    {quotes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register('startDate')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="endDate">Data de Término</Label>
                  <Input id="endDate" type="date" {...register('endDate')} />
                </div>
              </div>
            </Card>

            {/* Objeto e Escopo */}
            <Card className="bg-white border border-gray-200 rounded-[24px] p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-xs font-black">
                  2
                </span>
                Objeto e Escopo
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Descreva os serviços a serem prestados e as entregas esperadas.
              </p>
              <Textarea
                rows={8}
                placeholder="Descreva o objeto do contrato..."
                {...register('objectClause')}
                className="font-mono text-sm resize-none"
              />
            </Card>

            {/* Prazo */}
            <Card className="bg-white border border-gray-200 rounded-[24px] p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-xs font-black">
                  3
                </span>
                Prazo de Execução
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Defina o cronograma e as condições de prazo.
              </p>
              <Textarea
                rows={6}
                placeholder="Descreva as condições de prazo..."
                {...register('timelineClause')}
                className="font-mono text-sm resize-none"
              />
            </Card>

            {/* Valores e Pagamento */}
            <Card className="bg-white border border-gray-200 rounded-[24px] p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-xs font-black">
                  4
                </span>
                Valores e Forma de Pagamento
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Especifique valores, forma e condições de pagamento.
              </p>
              <Textarea
                rows={8}
                placeholder="Descreva as condições de pagamento..."
                {...register('paymentClause')}
                className="font-mono text-sm resize-none"
              />
            </Card>

            {/* IP, Confidencialidade e Rescisão */}
            <Card className="bg-white border border-gray-200 rounded-[24px] p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-xs font-black">
                  5
                </span>
                Propriedade Intelectual, Confidencialidade e Rescisão
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Cláusulas sobre IP, sigilo e condições de cancelamento.
              </p>
              <Textarea
                rows={12}
                placeholder="Descreva as cláusulas de IP, confidencialidade e rescisão..."
                {...register('ipClause')}
                className="font-mono text-sm resize-none"
              />
            </Card>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand text-white hover:bg-brand-dark rounded-xl px-8 shadow-lg shadow-brand/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{' '}
                    {isEditing ? 'Salvando...' : 'Criando...'}
                  </>
                ) : (
                  <>
                    <FileSignature className="w-4 h-4 mr-2" />{' '}
                    {isEditing ? 'Salvar Alterações' : 'Criar Contrato'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
