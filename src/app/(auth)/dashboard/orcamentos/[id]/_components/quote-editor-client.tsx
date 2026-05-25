'use client'

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
  Globe,
  Layers,
  Layout,
  Layout as LayoutIcon,
  Lock,
  Mail,
  Plus,
  Rocket,
  Search,
  Share2,
  Trash2,
  Upload,
  Users as UsersIcon,
  Zap,
  Zap as ZapIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ElementType } from 'react'
import { useEffect, useMemo, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Client } from '@/generated/prisma/client'
import { useDevProfile } from '@/hooks/useDevProfile'
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types'
import { ClientModal } from '../../../clientes/_components/client-modal'
import { createQuote } from '../../_actions/create-quote'
import { updateQuote } from '../../_actions/update-quote'
import type { CreateQuoteInput, UpdateQuoteInput } from '../../_schemas/quote'

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
}: {
  initialQuote?: EditorQuote | null
  clients: Client[]
  initialFeature?: EditorFeature | null
  initialFeatures?: EditorFeature[]
}) {
  const router = useRouter()
  const { getHours } = useDevProfile()

  const features = initialFeatures

  // Get unique categories from DB features
  const dbCategories = useMemo(() => {
    const cats = new Set(features.map((f) => f.categoria))
    return ['Todos', ...Array.from(cats)].sort()
  }, [features])

  const isNew = !initialQuote

  const [quote, setQuote] = useState<EditorQuote>({
    title: initialQuote?.title || '',
    clientId: initialQuote?.clientId || '',
    status: initialQuote?.status || 'rascunho',
    hourlyRate: initialQuote?.hourlyRate || 150,
    items: initialQuote?.items || [],
    discount: initialQuote?.discount || 0,
    urgencyFee: initialQuote?.urgencyFee || 0,
    entryAmount: initialQuote?.entryAmount || 0,
    installments: initialQuote?.installments || 1,
    expirationDate: initialQuote?.expirationDate || 
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
    description: initialQuote?.description || '',
  })

  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([])
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)

  useEffect(() => {
    if (isNew && initialFeature && features.length > 0) {
      const exists = quote.items.some(
        (item) => item.featureId === initialFeature.id,
      )
      if (!exists) {
        const hours = getHours(initialFeature)
        const newItem: EditorQuoteItem = {
          id: `temp-${Date.now()}-init`,
          name: initialFeature.nome,
          description: initialFeature.descricao,
          hours: hours,
          unitValue: hours * (quote.hourlyRate || 0),
          monthlyFee: initialFeature.monthlyFee,
          monthlyDuration: initialFeature.monthlyDuration,
          featureId: initialFeature.id,
          order: 0,
        }
        setQuote((prev) => ({
          ...prev,
          items: [newItem],
        }))
      }
    }
  }, [
    initialFeature,
    isNew,
    features,
    getHours,
    quote.hourlyRate,
    quote.items.length,
  ])

  const totals = useMemo(() => {
    const totalHoras = (quote.items || []).reduce(
      (acc: number, item) => acc + Number(item.hours),
      0,
    )
    const valorBruto = totalHoras * (quote.hourlyRate || 0)
    const valorDesconto = (valorBruto * (quote.discount || 0)) / 100
    const valorUrgencia = (valorBruto * (quote.urgencyFee || 0)) / 100
    const totalValor = valorBruto - valorDesconto + valorUrgencia

    const monthlyTotal = (quote.items || []).reduce(
      (acc: number, item) => acc + Number(item.monthlyFee || 0),
      0,
    )

    const prazoSemanas = Math.ceil(totalHoras / 20)
    const modulos = (quote.items || []).length
    const valorParcela =
      quote.installments && quote.installments > 1
        ? (totalValor - (quote.entryAmount || 0)) / quote.installments
        : 0

    return {
      totalHoras,
      valorBruto,
      valorDesconto,
      valorUrgencia,
      totalValor,
      monthlyTotal,
      prazoSemanas,
      modulos,
      valorParcela,
    }
  }, [quote])

  const handleAddFeatures = () => {
    const newItems: EditorQuoteItem[] = features
      .filter((f) => selectedFeatureIds.includes(f.id))
      .map((f, index) => ({
        id: `temp-${Date.now()}-${f.id}-${index}`,
        name: f.nome,
        description: f.descricao,
        hours: getHours(f),
        unitValue: getHours(f) * (quote.hourlyRate || 0),
        monthlyFee: f.monthlyFee,
        monthlyDuration: f.monthlyDuration,
        featureId: f.id,
        order: quote.items.length + index,
      }))

    setQuote((prev) => ({
      ...prev,
      items: [...(prev.items || []), ...newItems],
    }))
    setIsModalOpen(false)
    setSelectedFeatureIds([])
  }

  const updateItem = (itemId: string, updates: Partial<EditorQuoteItem>) => {
    setQuote((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item,
      ),
    }))
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...quote.items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newItems.length) return
    ;[newItems[index], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[index],
    ]

    const finalItems = newItems.map((item, idx) => ({ ...item, order: idx }))
    setQuote((prev) => ({ ...prev, items: finalItems }))
  }

  const removeItem = (itemId: string) => {
    setQuote((prev) => ({
      ...prev,
      items: (prev.items || []).filter((i) => i.id !== itemId),
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const finalQuote = {
        ...quote,
        totalHours: totals.totalHoras,
        totalValue: totals.totalValor,
        monthlyTotal: totals.monthlyTotal,
        expirationDate: new Date(quote.expirationDate),
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
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="hover:text-gray-600 transition-colors"
              >
                Orçamentos
              </button>
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span className="text-gray-900 font-medium">
                {isNew ? 'Novo Orçamento' : 'Editar Orçamento'}
              </span>
            </div>
            <input
              value={quote.title}
              onChange={(e) => setQuote({ ...quote, title: e.target.value })}
              placeholder="Título do Orçamento..."
              className="text-3xl font-bold bg-transparent border-none outline-none focus:text-brand placeholder:text-gray-300 w-full"
            />
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
              onClick={handleSave}
              disabled={loading}
              className="bg-brand text-white hover:bg-brand-dark rounded-xl px-8 shadow-lg shadow-brand/20"
            >
              {loading ? 'Salvando...' : 'Salvar Orçamento'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-8 bg-white border-gray-100 rounded-3xl shadow-sm">
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
                    <Button className="bg-gray-900 text-white hover:bg-black rounded-xl gap-2">
                      <Plus className="w-4 h-4" /> Adicionar Módulo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden rounded-3xl border-none">
                    <DialogHeader className="p-6 border-b border-gray-100">
                      <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        Catálogo de Funcionalidades
                      </DialogTitle>
                      <div className="mt-4 flex gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="Buscar funcionalidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-gray-50 border-none rounded-xl"
                          />
                        </div>
                        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                          {dbCategories.map((cat) => (
                            <Button
                              key={cat}
                              variant={
                                selectedCategory === cat ? 'default' : 'ghost'
                              }
                              size="sm"
                              onClick={() => setSelectedCategory(cat)}
                              className={cn(
                                'rounded-full h-8 px-4',
                                selectedCategory === cat
                                  ? 'bg-brand text-white hover:bg-brand-dark'
                                  : 'text-gray-500 hover:bg-gray-100',
                              )}
                            >
                              {cat}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredFeatures.map((f) => {
                          const Icon = categoryIcons[f.categoria] || Zap
                          const isSelected = selectedFeatureIds.includes(f.id)
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => {
                                setSelectedFeatureIds((prev) =>
                                  prev.includes(f.id)
                                    ? prev.filter((id) => id !== f.id)
                                    : [...prev, f.id],
                                )
                              }}
                              className={cn(
                                'flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left group',
                                isSelected
                                  ? 'bg-white border-brand shadow-md'
                                  : 'bg-white border-transparent hover:border-gray-200 hover:shadow-sm',
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
                                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
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
                            </button>
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

              <div className="space-y-3">
                {quote.items.length === 0 ? (
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
                    {quote.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-brand/20 hover:shadow-sm transition-all group"
                      >
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => moveItem(index, 'up')}
                            className="p-1 hover:bg-gray-100 rounded text-gray-400"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(index, 'down')}
                            className="p-1 hover:bg-gray-100 rounded text-gray-400"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="md:col-span-6">
                            <input
                              value={item.name}
                              onChange={(e) =>
                                updateItem(item.id, { name: e.target.value })
                              }
                              className="w-full font-bold text-gray-900 bg-transparent border-none outline-none focus:text-brand"
                            />
                            <p className="text-xs text-gray-400 truncate">
                              {item.description || 'Sem descrição'}
                            </p>
                          </div>
                          <div className="md:col-span-5 flex items-center gap-4">
                            <div className="relative w-20">
                              <input
                                type="number"
                                value={item.hours}
                                onChange={(e) =>
                                  updateItem(item.id, {
                                    hours: Number(e.target.value),
                                  })
                                }
                                className="w-full h-9 pl-2 pr-5 bg-gray-50 border-none rounded-lg text-sm font-mono font-bold text-gray-700 outline-none focus:ring-1 focus:ring-brand"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">
                                h
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="relative w-24">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">
                                  R$
                                </span>
                                <input
                                  type="number"
                                  value={item.monthlyFee}
                                  onChange={(e) =>
                                    updateItem(item.id, {
                                      monthlyFee: Number(e.target.value),
                                    })
                                  }
                                  className="w-full h-9 pl-6 pr-2 bg-brand/5 border-none rounded-lg text-sm font-mono font-bold text-brand outline-none focus:ring-1 focus:ring-brand"
                                />
                              </div>
                              <span className="text-[10px] text-brand font-bold">
                                /mês
                              </span>
                            </div>
                          </div>
                          <div className="md:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-8 bg-white border-gray-100 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">
                    Detalhamento Adicional
                  </h3>
                  <p className="text-xs text-gray-400">
                    Notas internas e descrição da proposta
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                  Descrição do Escopo (visível na proposta)
                </Label>
                <Textarea
                  value={quote.description}
                  onChange={(e) =>
                    setQuote({ ...quote, description: e.target.value })
                  }
                  placeholder="Descreva detalhes gerais do projeto que aparecerão para o cliente..."
                  className="min-h-[150px] bg-gray-50 border-none rounded-2xl resize-none focus-visible:ring-1 focus-visible:ring-brand"
                />
              </div>
            </Card>
          </div>

          {/* Sidebar Config */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="overflow-hidden border-none rounded-3xl shadow-xl bg-gray-900 text-white">
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
                    <span className="text-sm text-gray-400">Prazo Estimado</span>
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
                          <input
                            type="number"
                            value={quote.discount}
                            onChange={(e) =>
                              setQuote({
                                ...quote,
                                discount: Number(e.target.value),
                              })
                            }
                            className="w-full bg-white/5 border-none rounded h-6 text-center text-xs font-bold text-green-400 outline-none focus:ring-1 focus:ring-green-400/50"
                          />
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">
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
                          <input
                            type="number"
                            value={quote.urgencyFee}
                            onChange={(e) =>
                              setQuote({
                                ...quote,
                                urgencyFee: Number(e.target.value),
                              })
                            }
                            className="w-full bg-white/5 border-none rounded h-6 text-center text-xs font-bold text-orange-400 outline-none focus:ring-1 focus:ring-orange-400/50"
                          />
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">
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

              {quote.installments > 1 && (
                <div className="px-8 py-6 bg-brand/10 border-t border-brand/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-brand-light uppercase">
                        Parcelamento
                      </p>
                      <p className="text-sm font-medium">
                        {quote.installments}× de{' '}
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

            <Card className="p-8 bg-white border-gray-100 rounded-3xl shadow-sm space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Cliente do Projeto
                  </Label>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-brand text-[10px] font-bold uppercase"
                    onClick={() => setIsClientModalOpen(true)}
                  >
                    + Novo Cliente
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto no-scrollbar pr-1">
                  {initialClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => setQuote({ ...quote, clientId: client.id })}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                        quote.clientId === client.id
                          ? 'border-brand bg-brand/5 ring-1 ring-brand'
                          : 'border-gray-100 hover:border-gray-200',
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-xs shrink-0">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {client.name}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {client.email || 'Sem e-mail'}
                        </p>
                      </div>
                      {quote.clientId === client.id && (
                        <Check className="w-3.5 h-3.5 text-brand" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-50">
                <Label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  Configurações Gerais
                </Label>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-gray-500">Valor da Hora</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                        R$
                      </span>
                      <Input
                        type="number"
                        value={quote.hourlyRate}
                        onChange={(e) =>
                          setQuote({
                            ...quote,
                            hourlyRate: Number(e.target.value),
                          })
                        }
                        className="pl-9 h-11 bg-gray-50 border-none rounded-xl font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-gray-500">Validade</span>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="date"
                        value={quote.expirationDate}
                        onChange={(e) =>
                          setQuote({ ...quote, expirationDate: e.target.value })
                        }
                        className="pl-10 h-11 bg-gray-50 border-none rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-gray-500">Entrada</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">
                          R$
                        </span>
                        <Input
                          type="number"
                          value={quote.entryAmount}
                          onChange={(e) =>
                            setQuote({
                              ...quote,
                              entryAmount: Number(e.target.value),
                            })
                          }
                          className="pl-8 h-10 bg-gray-50 border-none rounded-xl text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-gray-500">Parcelas</span>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <Input
                          type="number"
                          min="1"
                          max="24"
                          value={quote.installments}
                          onChange={(e) =>
                            setQuote({
                              ...quote,
                              installments: Number(e.target.value),
                            })
                          }
                          className="pl-9 h-10 bg-gray-50 border-none rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ClientModal
        open={isClientModalOpen}
        onOpenChange={setIsClientModalOpen}
        onSuccess={(client) => {
          setQuote((prev) => ({ ...prev, clientId: client.id }))
          setIsClientModalOpen(false)
        }}
      />
    </div>
  )
}
