'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Calculator,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  CreditCard,
  Database,
  FileText,
  Globe,
  Layers,
  Layout,
  Layout as LayoutIcon,
  Lock,
  Mail,
  Plus,
  Rocket,
  Search,
  Settings,
  Share2,
  Trash2,
  Upload,
  X,
  Zap,
  Zap as ZapIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ElementType } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Client } from '@/generated/prisma/client'
import { useDevProfile } from '@/hooks/useDevProfile'
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types'
import { ClientModal } from '../../../clientes/_components/client-modal'
import { createQuote } from '../../_actions/create-quote'
import { updateQuote } from '../../_actions/update-quote'
import {
  type CreateQuoteInput,
  createQuoteSchema,
  type UpdateQuoteInput,
  updateQuoteSchema,
} from '../../_schemas/quote'

// Mapeamentos e dados mantidos como no original
const _profileInfo: Record<string, { name: string; icon: ElementType }> = {
  landing_page: { name: 'Landing Page Dev', icon: Globe },
  frontend: { name: 'Front-end Especialista', icon: LayoutIcon },
  backend: { name: 'Back-end / API Dev', icon: Database },
  fullstack: { name: 'Full Stack Solo', icon: ZapIcon },
  saas: { name: 'Dev de SaaS', icon: Rocket },
}

const _recommendedCategories: Record<string, string[]> = {
  landing_page: ['Landing Page', 'E-mail'],
  frontend: ['Dashboard', 'CMS', 'Landing Page'],
  backend: ['API', 'Autenticação', 'Pagamentos', 'Integrações'],
  fullstack: ['Autenticação', 'Pagamentos', 'Dashboard', 'CMS', 'API'],
  saas: ['Autenticação', 'Pagamentos', 'Dashboard', 'CMS', 'API', 'Upload'],
}

const categoryIcons: Record<string, ElementType> = {
  Autenticação: Lock,
  Dashboard: Layout,
  Pagamentos: CreditCard,
  'E-mail': Mail,
  Upload: Upload,
  CMS: Database,
  API: Globe,
  Integrações: Share2,
  Outro: Zap,
}

export interface EditorFeature {
  id: string
  nome: string
  descricao: string
  categoria: string
  baseHours: number
  complexity: string
  monthlyFee: number
  monthlyDuration: number
}

export interface EditorQuoteItem {
  id: string
  name: string
  description?: string | null
  hours: number
  unitValue: number
  monthlyFee: number
  monthlyDuration: number
  order: number
  featureId?: string | null
}

export interface EditorQuote {
  id?: string
  title: string
  clientId: string
  status: ProjectStatus
  hourlyRate: number
  totalHours: number
  totalValue: number
  monthlyTotal: number
  discount: number
  urgencyFee: number
  entryAmount: number
  installments: number
  expirationDate: string
  description: string
  items: EditorQuoteItem[]
}

export function QuoteEditorClient({
  initialQuote,
  clients: initialClients,
  initialFeature,
  initialFeatures = [],
  suggestedHourlyRate,
}: {
  initialQuote?: EditorQuote | null
  clients: Client[]
  initialFeature?: EditorFeature | null
  initialFeatures?: EditorFeature[]
  suggestedHourlyRate?: number
}) {
  const router = useRouter()
  const { profile, getHours } = useDevProfile()

  const features = initialFeatures

  // Get unique categories from DB features
  const dbCategories = useMemo(() => {
    const cats = new Set(features.map((f) => f.categoria))
    return ['Todos', ...Array.from(cats)].sort()
  }, [features])

  const isNew = !initialQuote

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateQuoteSchema),
    defaultValues: {
      id: initialQuote?.id,
      title: initialQuote?.title || '',
      clientId: initialQuote?.clientId || '',
      status: initialQuote?.status || 'rascunho',
      hourlyRate: initialQuote?.hourlyRate || suggestedHourlyRate || 150,
      totalHours: initialQuote?.totalHours || 0,
      totalValue: initialQuote?.totalValue || 0,
      monthlyTotal: initialQuote?.monthlyTotal || undefined,
      items: (initialQuote?.items || []).map((item) => ({
        ...item,
        hours: Number(item.hours),
        unitValue: Number(item.unitValue),
        monthlyFee: Number(item.monthlyFee),
      })),
      discount: initialQuote?.discount || undefined,
      urgencyFee: initialQuote?.urgencyFee || undefined,
      entryAmount: initialQuote?.entryAmount || undefined,
      installments: initialQuote?.installments || 1,
      expirationDate: initialQuote?.expirationDate
        ? new Date(initialQuote.expirationDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      description: initialQuote?.description || '',
    },
  })

  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: 'items',
  })

  const formValues = useWatch({ control })

  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([])
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)

  useEffect(() => {
    if (isNew && initialFeature && features.length > 0) {
      const exists = fields.some((item) => item.featureId === initialFeature.id)
      if (!exists) {
        const hours = getHours(initialFeature)
        const newItem = {
          name: initialFeature.nome,
          description: initialFeature.descricao,
          hours: hours,
          unitValue: hours * (Number(formValues.hourlyRate) || 150),
          monthlyFee: 0,
          monthlyDuration: 0,
          featureId: initialFeature.id,
          order: 0,
        }
        append(newItem)
        if (!formValues.monthlyTotal) {
          setValue('monthlyTotal', initialFeature.monthlyFee || 0)
        }
      }
    }
  }, [
    initialFeature,
    isNew,
    features,
    getHours,
    formValues.hourlyRate,
    formValues.monthlyTotal,
    fields,
    append,
    setValue,
  ])

  const totals = useMemo(() => {
    const totalHoras = (formValues.items || []).reduce(
      (acc: number, item) => acc + (Number(item?.hours) || 0),
      0,
    )
    const valorBruto = (formValues.items || []).reduce(
      (acc: number, item) => acc + (Number(item?.unitValue) || 0),
      0,
    )
    const valorDesconto =
      (valorBruto * (Number(formValues.discount) || 0)) / 100
    const valorUrgencia =
      (valorBruto * (Number(formValues.urgencyFee) || 0)) / 100
    const valorEntrada =
      (valorBruto * (Number(formValues.entryAmount) || 0)) / 100
    const totalValor = valorBruto - valorDesconto + valorUrgencia

    const monthlyTotal = Number(formValues.monthlyTotal) || 0

    const prazoSemanas = Math.ceil(totalHoras / 20)
    const modulos = (formValues.items || []).length
    const valorParcela =
      formValues.installments && Number(formValues.installments) > 1
        ? (totalValor - valorEntrada) / Number(formValues.installments)
        : 0

    return {
      totalHoras,
      valorBruto,
      valorDesconto,
      valorUrgencia,
      valorEntrada,
      totalValor,
      monthlyTotal,
      prazoSemanas,
      modulos,
      valorParcela,
    }
  }, [formValues])

  const handleAddFeatures = () => {
    const newItems = features
      .filter((f) => selectedFeatureIds.includes(f.id))
      .map((f, index) => {
        const hours = getHours(f)
        return {
          name: f.nome,
          description: f.descricao,
          hours: hours,
          unitValue: hours * (Number(formValues.hourlyRate) || 150),
          monthlyFee: 0,
          monthlyDuration: 0,
          featureId: f.id,
          order: fields.length + index,
        }
      })

    append(newItems)
    setIsModalOpen(false)
    setSelectedFeatureIds([])
  }

  const updateItem = (index: number, updates: any) => {
    const currentItem = fields[index]
    const updatedItem = { ...currentItem, ...updates }
    if (updates.hours !== undefined) {
      updatedItem.unitValue =
        updatedItem.hours * (Number(formValues.hourlyRate) || 150)
    }
    update(index, updatedItem)
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= fields.length) return
    move(index, targetIndex)
  }

  const removeItem = (index: number) => {
    remove(index)
  }

  const handleSave = async (data: UpdateQuoteInput) => {
    setLoading(true)
    try {
      const finalQuote = {
        ...data,
        totalHours: totals.totalHoras,
        totalValue: totals.totalValor,
        monthlyTotal: totals.monthlyTotal,
      }

      if (isNew) {
        const res = await createQuote(finalQuote as unknown as CreateQuoteInput)
        if (res.success) {
          toast.success('Orçamento criado!')
          router.push('/dashboard/orcamentos')
        } else {
          toast.error(res.error)
        }
      } else {
        const res = await updateQuote({
          ...finalQuote,
          id: initialQuote!.id,
        } as unknown as UpdateQuoteInput)
        if (res.success) {
          toast.success('Orçamento atualizado!')
          router.push('/dashboard/orcamentos')
        } else {
          toast.error(res.error)
        }
      }
    } catch (_error) {
      toast.error('Erro ao salvar orçamento')
    } finally {
      setLoading(false)
    }
  }

  const filteredFeatures = features.filter((f) => {
    const matchesSearch =
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === 'Todos' || f.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-[#F8F7F3] pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-brand/90 px-8 pt-16 pb-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-light/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-white/60 mb-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-auto p-0 text-white/60 hover:text-white hover:bg-transparent transition-colors text-xs font-medium"
            >
              Orçamentos
            </Button>
            <ChevronLeft className="w-3 h-3 rotate-180 text-white/30" />
            <span className="text-white font-medium text-sm">
              {isNew ? 'Novo Orçamento' : 'Editar Orçamento'}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    {isNew ? 'Novo Orçamento' : 'Editar Orçamento'}
                  </h1>
                  <p className="text-white/60 text-sm mt-1">
                    Monte o escopo, defina valores e gere uma proposta
                    profissional para seu cliente
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="rounded-xl text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit(handleSave)}
                disabled={loading}
                className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl px-8 shadow-xl shadow-black/20 font-bold"
              >
                {loading ? 'Salvando...' : 'Salvar Orçamento'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-8 space-y-6">
            {/* Project Information Card */}
            <Card className="p-8 bg-white border-gray-100 rounded-[32px] shadow-sm space-y-10">
              {/* Basic Info: Title & Client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Field>
                  <FieldLabel className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2 px-1">
                    Título do Projeto
                  </FieldLabel>
                  <Input
                    {...register('title')}
                    placeholder="Ex: Desenvolvimento de App Mobile"
                    className="h-12 bg-gray-50 border-none rounded-xl font-bold text-gray-900 focus-visible:ring-1 focus-visible:ring-brand"
                  />
                  {errors.title && (
                    <FieldError>{errors.title.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <FieldLabel className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                      Cliente
                    </FieldLabel>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-brand text-[10px] font-bold uppercase tracking-wider hover:no-underline"
                      onClick={() => setIsClientModalOpen(true)}
                    >
                      + Novo Cliente
                    </Button>
                  </div>
                  <Controller
                    control={control}
                    name="clientId"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-12 bg-gray-50 border-none rounded-xl text-gray-900 font-medium">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {initialClients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.clientId && (
                    <FieldError>{errors.clientId.message}</FieldError>
                  )}
                </Field>
              </div>

              {/* Financial Configs */}
              <div className="pt-10 border-t border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Configurações Financeiras
                    </h3>
                    <p className="text-xs text-gray-400">
                      Taxas, mensalidade e prazos
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Field>
                    <FieldLabel className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2 px-1">
                      Valor da Hora
                    </FieldLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                        R$
                      </span>
                      <Input
                        type="number"
                        {...register('hourlyRate', {
                          onChange: (e) => {
                            const newRate = Number(e.target.value)
                            const currentItems = fields.map((item, idx) => ({
                              ...item,
                              unitValue: (Number(item.hours) || 0) * newRate,
                            }))
                            setValue('items', currentItems as any)
                          },
                        })}
                        className="pl-9 h-12 bg-gray-50 border-none rounded-xl font-mono font-bold text-gray-900 focus-visible:ring-1 focus-visible:ring-brand"
                      />
                    </div>
                    {suggestedHourlyRate &&
                    Number(formValues.hourlyRate) === suggestedHourlyRate ? (
                      <span className="text-[10px] text-brand font-medium mt-1 px-1">
                        Do seu perfil configurado
                      </span>
                    ) : suggestedHourlyRate &&
                      Number(formValues.hourlyRate) !== suggestedHourlyRate ? (
                      <span className="text-[10px] text-orange-500 font-medium mt-1 px-1">
                        Personalizado · seu perfil: R$ {suggestedHourlyRate}
                      </span>
                    ) : null}
                    {errors.hourlyRate && (
                      <FieldError>{errors.hourlyRate.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2 px-1">
                      Mensalidade Recurrente
                    </FieldLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand text-sm font-bold">
                        R$
                      </span>
                      <Input
                        type="number"
                        {...register('monthlyTotal')}
                        placeholder="0"
                        className="pl-9 h-12 bg-gray-50 border-none rounded-xl font-mono font-bold text-brand focus-visible:ring-1 focus-visible:ring-brand"
                      />
                    </div>
                    {errors.monthlyTotal && (
                      <FieldError>{errors.monthlyTotal.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2 px-1">
                      Validade da Proposta
                    </FieldLabel>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                      <Input
                        type="date"
                        value={
                          formValues.expirationDate instanceof Date
                            ? formValues.expirationDate
                                .toISOString()
                                .split('T')[0]
                            : typeof formValues.expirationDate === 'string'
                              ? formValues.expirationDate
                              : ''
                        }
                        onChange={(e) =>
                          setValue('expirationDate', new Date(e.target.value))
                        }
                        className="pl-10 h-12 bg-gray-50 border-none rounded-xl font-bold text-gray-700 focus-visible:ring-1 focus-visible:ring-brand"
                      />
                    </div>
                    {errors.expirationDate && (
                      <FieldError>{errors.expirationDate.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2 px-1">
                      Entrada (Setup)
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        type="number"
                        {...register('entryAmount')}
                        placeholder="0"
                        className="h-12 bg-gray-50 border-none rounded-xl font-bold text-gray-700 focus-visible:ring-1 focus-visible:ring-brand pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold pointer-events-none">
                        %
                      </span>
                    </div>
                    {errors.entryAmount && (
                      <FieldError>{errors.entryAmount.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2 px-1">
                      Parcelas
                    </FieldLabel>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                      <Input
                        type="number"
                        min="1"
                        {...register('installments')}
                        className="pl-10 h-12 bg-gray-50 border-none rounded-xl font-bold text-gray-700 focus-visible:ring-1 focus-visible:ring-brand"
                      />
                    </div>
                    {errors.installments && (
                      <FieldError>{errors.installments.message}</FieldError>
                    )}
                  </Field>
                </div>
              </div>

              {/* Scope Description */}
              <div className="pt-10 border-t border-gray-100">
                <Field>
                  <FieldLabel className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2 px-1">
                    Descrição do Escopo (visível na proposta)
                  </FieldLabel>
                  <Textarea
                    {...register('description')}
                    placeholder="Descreva detalhes gerais do projeto que aparecerão para o cliente..."
                    className="min-h-[100px] bg-gray-50 border-none rounded-2xl resize-none focus-visible:ring-1 focus-visible:ring-brand text-sm leading-relaxed"
                  />
                  {errors.description && (
                    <FieldError>{errors.description.message}</FieldError>
                  )}
                </Field>
              </div>
            </Card>

            {/* Project Scope Card */}
            <Card className="p-8 bg-white border-gray-100 rounded-[24px] shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">
                      Escopo do Projeto
                    </h3>
                    <p className="text-xs text-gray-400">
                      Adicione módulos e funcionalidades ao projeto
                    </p>
                  </div>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gray-900 text-white hover:bg-black rounded-xl gap-2 shadow-lg shadow-black/10 ">
                      <Plus className="w-4 h-4" /> Adicionar Módulo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl border-none max-h-[90vh] flex flex-col">
                    <DialogHeader className="p-6 border-b border-gray-100 shrink-0">
                      <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        Catálogo de Funcionalidades
                      </DialogTitle>
                      <div className="mt-4 flex flex-col gap-4">
                        <div className="relative w-full group">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand transition-colors" />
                          <Input
                            placeholder="Buscar funcionalidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-gray-50 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-brand/50 transition-all w-full"
                          />
                          {searchTerm && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setSearchTerm('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 pb-1">
                          {dbCategories.map((cat) => (
                            <Button
                              key={cat}
                              variant={
                                selectedCategory === cat ? 'default' : 'ghost'
                              }
                              size="xs"
                              onClick={() => setSelectedCategory(cat)}
                              className={cn(
                                'rounded-full px-3 text-[10px] font-bold uppercase tracking-wider',
                                selectedCategory === cat
                                  ? 'bg-brand text-white hover:bg-brand-dark'
                                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100',
                              )}
                            >
                              {cat}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto min-h-0 p-6 bg-gray-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredFeatures.map((f) => {
                          const Icon = categoryIcons[f.categoria] || Zap
                          const isSelected = selectedFeatureIds.includes(f.id)
                          return (
                            <Button
                              key={f.id}
                              variant="ghost"
                              onClick={() => {
                                setSelectedFeatureIds((prev) =>
                                  prev.includes(f.id)
                                    ? prev.filter((id) => id !== f.id)
                                    : [...prev, f.id],
                                )
                              }}
                              className={cn(
                                'flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left h-auto whitespace-normal group',
                                isSelected
                                  ? 'bg-white border-brand shadow-md hover:bg-white'
                                  : 'bg-white border-transparent hover:border-gray-200 hover:shadow-sm hover:bg-white',
                              )}
                            >
                              <div
                                className={cn(
                                  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                                  isSelected
                                    ? 'bg-brand text-white'
                                    : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600',
                                )}
                              >
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <h4 className="font-bold text-gray-900 truncate">
                                    {f.nome}
                                  </h4>
                                  <span className="text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded uppercase">
                                    {f.baseHours}h
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-normal">
                                  {f.descricao}
                                </p>
                              </div>
                              <div
                                className={cn(
                                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                                  isSelected
                                    ? 'border-brand bg-brand text-white'
                                    : 'border-gray-200',
                                )}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </Button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-white flex items-center justify-between">
                      <p className="text-sm text-gray-400">
                        {selectedFeatureIds.length} funcionalidades selecionadas
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsModalOpen(false)
                            setSelectedFeatureIds([])
                          }}
                          className="rounded-xl"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleAddFeatures}
                          disabled={selectedFeatureIds.length === 0}
                          className="bg-brand text-white hover:bg-brand-dark rounded-xl px-8"
                        >
                          Adicionar ao Orçamento
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {fields.length === 0 ? (
                <div className="relative overflow-hidden py-24 text-center bg-gradient-to-b from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-200 group hover:border-brand/30 hover:bg-brand/[0.02] transition-all duration-300">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/[0.03] via-transparent to-transparent" />
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand/10 to-brand/5 flex items-center justify-center mx-auto mb-6 ring-1 ring-brand/10 group-hover:ring-brand/20 group-hover:scale-110 transition-all duration-300">
                      <Layers className="w-10 h-10 text-brand/40 group-hover:text-brand/60 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Nenhum módulo adicionado
                    </h3>
                    <p className="text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed">
                      Adicione funcionalidades do catálogo para compor o escopo
                      do projeto
                    </p>
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-brand text-white hover:bg-brand-dark rounded-xl gap-2 shadow-lg shadow-brand/20"
                    >
                      <Plus className="w-4 h-4" /> Adicionar Módulo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-brand/20 hover:shadow-md hover:shadow-brand/[0.02] transition-all duration-200"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-gray-200 to-transparent rounded-full group-hover:via-brand/40 transition-all duration-300" />
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveItem(index, 'up')}
                          className="h-6 w-6 p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveItem(index, 'down')}
                          className="h-6 w-6 p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-5">
                          <Input
                            {...register(`items.${index}.name`)}
                            className="w-full font-bold text-gray-900 bg-transparent border-none outline-none focus-visible:ring-0 focus:text-brand p-0 h-auto"
                          />
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {item.description || 'Sem descrição'}
                          </p>
                        </div>
                        <div className="md:col-span-6 flex items-center justify-end gap-4">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl group-hover:bg-gray-100/50 transition-colors">
                            <Clock className="w-3.5 h-3.5 text-gray-300" />
                            <div className="relative w-20">
                              <Input
                                type="number"
                                {...register(`items.${index}.hours`, {
                                  onChange: (e) =>
                                    updateItem(index, {
                                      hours: Number(e.target.value),
                                    }),
                                })}
                                className="w-full h-8 pl-2 pr-6 bg-transparent border-none rounded-lg text-sm font-mono font-bold text-gray-700 outline-none focus-visible:ring-0 p-0"
                              />
                              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium pointer-events-none">
                                h
                              </span>
                            </div>
                            <span className="text-xs text-gray-300 font-mono border-l border-gray-200 pl-2">
                              {(
                                (Number(item.hours) || 0) *
                                (Number(formValues.hourlyRate) || 0)
                              ).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {fields.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full rounded-2xl border-2 border-dashed border-gray-200 py-6 text-gray-400 hover:text-brand hover:border-brand/30 hover:bg-brand/[0.02] transition-all gap-2"
                  >
                    <Plus className="w-4 h-4" /> Adicionar mais módulos
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-8 space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-400 mb-3">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Esforço
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900 font-mono">
                      {totals.totalHoras}
                    </span>
                    <span className="text-sm text-gray-400 font-medium">
                      horas
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-400 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Prazo
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900 font-mono">
                      {totals.prazoSemanas}
                    </span>
                    <span className="text-sm text-gray-400 font-medium">
                      semanas
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Summary Card */}
              <div className="relative overflow-hidden rounded-[32px] shadow-xl bg-gray-900 text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand/10 rounded-full blur-3xl" />

                <div className="relative p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-brand-light" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-light">
                        Resumo Financeiro
                      </h3>
                      <p className="text-[10px] text-gray-500">
                        Projeção de valores
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Valor Bruto</span>
                      <span className="font-mono font-semibold text-gray-200">
                        {totals.valorBruto.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Desconto</span>
                        <div className="relative w-16">
                          <Input
                            type="number"
                            {...register('discount')}
                            placeholder="0"
                            className="w-full bg-white/5 border border-white/10 rounded-lg h-7 text-center text-xs font-bold text-green-400 outline-none focus-visible:ring-1 focus-visible:ring-green-400/50 p-0 hover:bg-white/10 transition-colors"
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-gray-500 pointer-events-none font-medium">
                            %
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-green-400 font-medium">
                        -{' '}
                        {totals.valorDesconto.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Urgência</span>
                        <div className="relative w-16">
                          <Input
                            type="number"
                            {...register('urgencyFee')}
                            placeholder="0"
                            className="w-full bg-white/5 border border-white/10 rounded-lg h-7 text-center text-xs font-bold text-orange-400 outline-none focus-visible:ring-1 focus-visible:ring-orange-400/50 p-0 hover:bg-white/10 transition-colors"
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-gray-500 pointer-events-none font-medium">
                            %
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-orange-400 font-medium">
                        +{' '}
                        {totals.valorUrgencia.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                          Subtotal
                        </span>
                        <span className="font-mono text-gray-300">
                          {(
                            totals.valorBruto -
                            totals.valorDesconto +
                            totals.valorUrgencia
                          ).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Setup */}
                <div className="relative px-8 py-7 bg-gradient-to-r from-brand/20 via-brand/10 to-transparent border-t border-white/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-brand-light uppercase tracking-wider">
                        Investimento Total (Setup)
                      </span>
                      <div className="text-4xl font-mono font-black text-white mt-1">
                        {totals.totalValor.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center backdrop-blur-sm ring-1 ring-white/10">
                      <Calculator className="w-6 h-6 text-brand-light" />
                    </div>
                  </div>
                </div>

                {/* Monthly Recurring */}
                <div className="px-8 py-5 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-brand-light" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-brand-light uppercase tracking-wider leading-tight">
                          Mensalidade
                        </p>
                        <p className="text-[9px] text-gray-500">Recorrente</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-mono font-bold">
                        {totals.monthlyTotal.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">/mês</span>
                    </div>
                  </div>
                </div>

                {/* Installments */}
                {Number(formValues.installments) > 1 && (
                  <div className="px-8 py-5 bg-brand/10 border-t border-brand/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-brand-light" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-brand-light uppercase tracking-wider leading-tight">
                            Parcelamento
                          </p>
                          {Number(formValues.entryAmount) > 0 && (
                            <p className="text-[9px] text-gray-400">
                              Entrada de{' '}
                              {totals.valorEntrada.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-mono font-bold">
                          {Number(formValues.installments)}×{' '}
                          {totals.valorParcela.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </p>
                        <p className="text-[9px] text-gray-400">
                          {totals.valorEntrada > 0
                            ? `Entrada de ${Number(formValues.entryAmount) || 0}% + ${Number(formValues.installments)}×`
                            : `${Number(formValues.installments)} parcelas`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClientModal
        open={isClientModalOpen}
        onOpenChange={setIsClientModalOpen}
        onSuccess={(client) => {
          setValue('clientId', client.id)
          setIsClientModalOpen(false)
        }}
      />
    </div>
  )
}
