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
  User as UserIcon,
  Users as UsersIcon,
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
  software_house: { name: 'Software House', icon: UsersIcon },
  saas: { name: 'Dev de SaaS', icon: Rocket },
}

const _recommendedCategories: Record<string, string[]> = {
  landing_page: ['Landing Page', 'E-mail'],
  frontend: ['Dashboard', 'CMS', 'Landing Page'],
  backend: ['API', 'Autenticação', 'Pagamentos', 'Integrações'],
  fullstack: ['Autenticação', 'Pagamentos', 'Dashboard', 'CMS', 'API'],
  saas: ['Autenticação', 'Pagamentos', 'Dashboard', 'CMS', 'API', 'Upload'],
  software_house: [
    'Autenticação',
    'Pagamentos',
    'Dashboard',
    'CMS',
    'API',
    'Integrações',
    'Upload',
  ],
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
      id: initialQuote?.id || '',
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
    const valorDesconto = (valorBruto * (Number(formValues.discount) || 0)) / 100
    const valorUrgencia = (valorBruto * (Number(formValues.urgencyFee) || 0)) / 100
    const valorEntrada = (valorBruto * (Number(formValues.entryAmount) || 0)) / 100
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
      updatedItem.unitValue = updatedItem.hours * (Number(formValues.hourlyRate) || 150)
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
      <div className="px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-auto p-0 hover:bg-transparent hover:text-gray-600 transition-colors"
            >
              Orçamentos
            </Button>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span className="text-gray-900 font-medium">
              {isNew ? 'Novo Orçamento' : 'Editar Orçamento'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl border-gray-200"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit(handleSave)}
              disabled={loading}
              className="bg-brand text-white hover:bg-brand-dark rounded-xl px-8 shadow-lg shadow-brand/20"
            >
              {loading ? 'Salvando...' : 'Salvar Orçamento'}
            </Button>
          </div>
        </div>

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
                  {errors.title && <FieldError>{errors.title.message}</FieldError>}
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
                      <Select value={field.value ?? undefined} onValueChange={field.onChange}>
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
                    {(suggestedHourlyRate && Number(formValues.hourlyRate) === suggestedHourlyRate) ? (
                      <span className="text-[10px] text-brand font-medium mt-1 px-1">
                        Do seu perfil configurado
                      </span>
                    ) : suggestedHourlyRate && Number(formValues.hourlyRate) !== suggestedHourlyRate ? (
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
                            ? formValues.expirationDate.toISOString().split('T')[0]
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
                  <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-medium">
                      Comece adicionando módulos do catálogo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-brand/20 hover:shadow-sm transition-all group"
                      >
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveItem(index, 'up')}
                            className="h-6 w-6 p-1 text-gray-400 hover:bg-gray-100"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveItem(index, 'down')}
                            className="h-6 w-6 p-1 text-gray-400 hover:bg-gray-100"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="md:col-span-6">
                            <Input
                              {...register(`items.${index}.name`)}
                              className="w-full font-bold text-gray-900 bg-transparent border-none outline-none focus-visible:ring-0 focus:text-brand p-0 h-auto"
                            />
                            <p className="text-xs text-gray-400 truncate">
                              {item.description || 'Sem descrição'}
                            </p>
                          </div>
                          <div className="md:col-span-5 flex items-center justify-end gap-4">
                            <div className="relative w-24">
                              <Input
                                type="number"
                                {...register(`items.${index}.hours`, {
                                  onChange: (e) =>
                                    updateItem(index, {
                                      hours: Number(e.target.value),
                                    }),
                                })}
                                className="w-full h-9 pl-3 pr-7 bg-gray-50 border-none rounded-lg text-sm font-mono font-bold text-gray-700 outline-none focus-visible:ring-1 focus-visible:ring-brand"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">
                                horas
                              </span>
                            </div>
                          </div>
                          <div className="md:col-span-1 flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </Card>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="overflow-hidden border-none rounded-[32px] shadow-xl bg-gray-900 text-white sticky top-8">
              <div className="p-8 border-b border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-light">
                    Resumo Financeiro
                  </h3>
                  <Calculator className="w-5 h-5 text-gray-500" />
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Esforço Total</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-mono font-bold text-lg">
                        {totals.totalHoras}h
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      Prazo Estimado
                    </span>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-bold text-sm">
                        {totals.prazoSemanas} semanas
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Valor Bruto</span>
                      <span className="font-mono text-gray-300">
                        {totals.valorBruto.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-400">Desconto</span>
                        <div className="relative w-14">
                          <Input
                            type="number"
                            {...register('discount')}
                            placeholder="0"
                            className="w-full bg-white/5 border-none rounded h-6 text-center text-xs font-bold text-green-400 outline-none focus-visible:ring-1 focus-visible:ring-green-400/50 p-0"
                          />
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                            %
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-green-400">
                        -{' '}
                        {totals.valorDesconto.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-400">Urgência</span>
                        <div className="relative w-14">
                          <Input
                            type="number"
                            {...register('urgencyFee')}
                            placeholder="0"
                            className="w-full bg-white/5 border-none rounded h-6 text-center text-xs font-bold text-orange-400 outline-none focus-visible:ring-1 focus-visible:ring-orange-400/50 p-0"
                          />
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                            %
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-orange-400">
                        +{' '}
                        {totals.valorUrgencia.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-black/40">
                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                    Investimento Total (Setup)
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-mono font-black">
                      {totals.totalValor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 pt-4 border-t border-white/10">
                  <span className="text-[10px] font-bold text-brand-light uppercase tracking-wider">
                    Mensalidade Recurrente
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-bold">
                      {totals.monthlyTotal.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                    <span className="text-xs text-gray-400">/mês</span>
                  </div>
                </div>
              </div>

              {Number(formValues.installments) > 1 && (
                <div className="px-8 py-6 bg-brand/10 border-t border-brand/10 space-y-3">
                  {(Number(formValues.entryAmount) || 0) > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[10px] font-bold text-brand-light uppercase">
                        Entrada ({Number(formValues.entryAmount) || 0}%)
                      </span>
                      <span className="font-mono font-medium">
                        {totals.valorEntrada.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-brand-light uppercase">
                        Parcelamento
                      </p>
                      <p className="text-sm font-medium">
                        {Number(formValues.installments)}× de{' '}
                        {totals.valorParcela.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                    </div>
                    <CreditCard className="w-5 h-5 text-brand/40" />
                  </div>
                </div>
              )}
            </Card>
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
