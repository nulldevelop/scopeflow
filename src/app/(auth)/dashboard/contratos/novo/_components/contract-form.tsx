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

const defaultObjectClause = `1. OBJETO E ESCOPO DOS SERVIÇOS

1.1 Objeto
O presente contrato tem por objeto a prestação de serviços de desenvolvimento completo e suporte técnico contínuo do projeto denominado "[NOME DO PROJETO]", abrangendo desde a concepção e desenvolvimento do sistema até a manutenção e suporte pós-entrega.

1.2 Fase de Desenvolvimento
Compreende a criação, implementação e entrega do projeto conforme especificações acordadas entre as partes, incluindo todas as funcionalidades, páginas e integrações definidas no escopo original, detalhadas no Anexo I deste contrato (documento de escopo ou e-mail de formalização acordado entre as partes).

1.3 Aceite Formal e Entrega
Considerar-se-á formalmente entregue o projeto após notificação escrita do CONTRATADO ao CONTRATANTE. O CONTRATANTE terá o prazo de 7 (sete) dias corridos para homologar a entrega ou apontar inconformidades em relação ao escopo definido no Anexo I. Transcorrido esse prazo sem manifestação, a entrega será considerada aceita tacitamente, iniciando-se a contagem da garantia.

1.4 Garantia (90 dias após entrega)
Serviços incluídos na garantia: correção de bugs funcionais — páginas que não carregam, botões e links que param de funcionar, formulários que não enviam dados, erros exibidos na interface e quaisquer falhas que impossibilitem o funcionamento normal do sistema conforme entregue originalmente.

Serviços cobrados adicionalmente (R$ [VALOR]/h):
- Alterações visuais: espaçamentos, tipografia, cores, fontes, reorganização de seções e ajustes de layout.
- Novas funcionalidades: recursos, módulos ou integrações não existentes no sistema original.
- Inovações e melhorias: novas páginas, seções ou fluxos não previstos no escopo original.
- Alterações estruturais: arquitetura do sistema, banco de dados ou infraestrutura.
- Correção de bugs após o período de 90 dias de garantia.`

const defaultTimelineClause = `2. PRAZO DE EXECUÇÃO

2.1 Prazo para Correção de Bugs
O CONTRATADO se compromete a resolver bugs funcionais no prazo máximo de 48 (quarenta e oito) horas após a comunicação formal pelo CONTRATANTE, a contar da confirmação de recebimento pelo CONTRATADO.

2.2 Prazo para Serviços Adicionais
Para serviços cobrados adicionalmente, o prazo de execução será de até 12 (doze) horas após a confirmação do pagamento pelo CONTRATANTE, salvo complexidade técnica que justifique prazo diferenciado, a ser acordado previamente entre as partes por escrito.

2.3 Comunicação
Toda solicitação de serviço deverá ser realizada por meio de canal de comunicação previamente acordado entre as partes (WhatsApp, e-mail ou plataforma de gestão), acompanhada de descrição clara do problema ou serviço solicitado.`

const defaultPaymentClause = `3. VALORES E FORMA DE PAGAMENTO

3.1 Valor do Desenvolvimento
O valor total pelos serviços de desenvolvimento é de R$ [VALOR TOTAL] ([VALOR POR EXTENSO]).

3.2 Forma de Pagamento
[Descreva o parcelamento acordado, ex: parcelado em 3 (três) parcelas de R$ X cada.]

3.3 Saldo Restante
[Descreva o saldo remanescente e prazo de vencimento, se aplicável.]

3.4 Valor do Suporte Técnico
Os serviços de suporte técnico cobrados adicionalmente serão precificados à razão de R$ [VALOR]/h (reais por hora trabalhada), ou conforme proposta específica apresentada pelo CONTRATADO antes do início de cada execução.

3.5 Orçamento Prévio para Suporte
Antes de qualquer execução de serviço adicional, o CONTRATADO apresentará ao CONTRATANTE um orçamento detalhado com estimativa de horas e valor total. O início dos serviços fica condicionado à aprovação expressa do CONTRATANTE.

3.6 Forma de Pagamento do Suporte
O pagamento pelos serviços adicionais deverá ser realizado de forma antecipada, antes do início da execução, por meio de transferência bancária (PIX, TED ou DOC) ou outro meio acordado entre as partes.`

const defaultIpClause = `4. PROPRIEDADE INTELECTUAL, CONFIDENCIALIDADE E RESCISÃO

4.1 Propriedade Intelectual
Todo o código-fonte, design e demais ativos digitais produzidos pelo CONTRATADO são de propriedade exclusiva do CONTRATANTE após a quitação integral dos valores devidos. Enquanto houver valores em aberto, o CONTRATADO retém os direitos sobre os materiais desenvolvidos.

4.2 Hospedagem e Domínio
A hospedagem e o domínio do projeto já são de propriedade exclusiva do CONTRATANTE, não havendo qualquer ônus ou vinculação a este contrato quanto a esses itens.

4.3 Confidencialidade
Ambas as partes se comprometem a manter sigilo sobre informações confidenciais trocadas no âmbito deste contrato, incluindo dados técnicos, comerciais e estratégicos, pelo prazo de 2 (dois) anos após o encerramento do contrato.

4.4 Rescisão
Qualquer das partes poderá rescindir o presente contrato mediante aviso prévio de 30 (trinta) dias, por escrito. Em caso de rescisão imotivada pelo CONTRATANTE, será devida ao CONTRATADO uma multa equivalente a 20% (vinte por cento) do valor dos serviços contratados e não executados. Em caso de rescisão imotivada pelo CONTRATADO, o mesmo deverá devolver os valores recebidos proporcionalmente aos serviços não executados, acrescidos de multa de 20% (vinte por cento).

4.5 Foro de Eleição
As partes elegem o foro da comarca de Campina Grande do Sul, estado do Paraná, para dirimir quaisquer controvérsias oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`

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
            : defaultObjectClause,
          timelineClause: preselectedQuote
            ? buildTimelineClause(preselectedQuote)
            : defaultTimelineClause,
          paymentClause: preselectedQuote
            ? buildPaymentClause(preselectedQuote)
            : defaultPaymentClause,
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
                    <p className="text-danger text-xs">
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
                    <p className="text-danger text-xs">
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
                    <p className="text-danger text-xs">
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
