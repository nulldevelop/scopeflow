'use client'

import {
  ArrowRight,
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
  Info,
  Layers,
  Layout,
  Layout as LayoutIcon,
  Lock,
  Mail,
  Plus,
  Rocket,
  Search,
  Share2,
  Sparkles,
  Trash2,
  Upload,
  Users as UsersIcon,
  Zap,
  Zap as ZapIcon,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useScopeFlow } from '@/context/ScopeFlowContext'
import { useDevProfile } from '@/hooks/useDevProfile'
import { cn } from '@/lib/utils'
import { type DevProfile, Feature, type Quote, type QuoteItem } from '@/types'

const profileInfo: Record<string, { name: string; icon: any }> = {
  landing_page: { name: 'Landing Page Dev', icon: Globe },
  frontend: { name: 'Front-end Especialista', icon: LayoutIcon },
  backend: { name: 'Back-end / API Dev', icon: Database },
  fullstack: { name: 'Full Stack Solo', icon: ZapIcon },
  software_house: { name: 'Software House', icon: UsersIcon },
  saas: { name: 'Dev de SaaS', icon: Rocket },
}

const recommendedCategories: Record<string, string[]> = {
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

const categoryIcons: Record<string, any> = {
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

const categories = [
  'Todos',
  'Autenticação',
  'Pagamentos',
  'Dashboard',
  'E-mail',
  'Upload',
  'CMS',
  'API',
  'Integrações',
  'Outro',
]

export default function QuoteEditorPage({
  params: propsParams,
}: {
  params?: { id: string }
}) {
  const router = useRouter()
  const hookParams = useParams()
  const { quotes, features, user, updateQuote, addQuote } = useScopeFlow()
  const { profile, setProfile, isRelevant, getHours } = useDevProfile()

  const id = propsParams?.id || (hookParams?.id as string)
  const isNew = id === 'novo' || !id

  const [quote, setQuote] = useState<Partial<Quote>>({
    titulo: '',
    clienteNome: '',
    clienteEmail: '',
    status: 'rascunho',
    valorHora: user.valorHora,
    itens: [],
    desconto: 0,
    acrescimoUrgencia: 0,
    entrada: 0,
    parcelas: 1,
    criadoEm: new Date().toISOString().split('T')[0],
    validoAte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [featureSearch, setFeatureSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([])
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    if (!isNew && id) {
      const found = quotes.find((q) => q.id === id)
      if (found) {
        setQuote(found)
      }
    }
  }, [id, isNew, quotes])

  const totals = useMemo(() => {
    const totalHoras = (quote.itens || []).reduce(
      (acc, item) => acc + item.horas,
      0,
    )
    const valorBruto = totalHoras * (quote.valorHora || 0)
    const valorDesconto = (valorBruto * (quote.desconto || 0)) / 100
    const valorUrgencia = (valorBruto * (quote.acrescimoUrgencia || 0)) / 100
    const totalValor = valorBruto - valorDesconto + valorUrgencia
    const prazoSemanas = Math.ceil(totalHoras / 20)
    const modulos = (quote.itens || []).length
    const valorParcela =
      quote.parcelas && quote.parcelas > 0
        ? (totalValor - (quote.entrada || 0)) / quote.parcelas
        : 0

    return {
      totalHoras,
      valorBruto,
      valorDesconto,
      valorUrgencia,
      totalValor,
      prazoSemanas,
      modulos,
      valorParcela,
    }
  }, [quote])

  const handleAddFeatures = () => {
    const newItems: QuoteItem[] = features
      .filter((f) => selectedFeatureIds.includes(f.id))
      .map((f) => ({
        id: `${f.id}-${Date.now()}`,
        nome: f.nome,
        horas: getHours(f),
        valorUnitario: getHours(f) * (quote.valorHora || 0),
      }))

    setQuote((prev) => ({
      ...prev,
      itens: [...(prev.itens || []), ...newItems],
    }))
    setIsModalOpen(false)
    setSelectedFeatureIds([])
  }

  const removeItem = (itemId: string) => {
    setQuote((prev) => ({
      ...prev,
      itens: (prev.itens || []).filter((i) => i.id !== itemId),
    }))
  }

  const handleSave = () => {
    const finalQuote = {
      ...quote,
      ...totals,
      id: isNew ? Math.random().toString(36).substr(2, 9) : id,
    } as Quote

    if (isNew) {
      addQuote(finalQuote)
    } else {
      updateQuote(finalQuote)
    }
    router.push('/orcamentos')
  }

  const filteredFeatures = features.filter((f) => {
    const matchesSearch =
      f.nome.toLowerCase().includes(featureSearch.toLowerCase()) ||
      f.descricao.toLowerCase().includes(featureSearch.toLowerCase()) ||
      f.categoria.toLowerCase().includes(featureSearch.toLowerCase())
    const matchesCategory =
      activeCategory === 'Todos' || f.categoria === activeCategory
    return matchesSearch && matchesCategory
  })

  const ActiveProfileIcon = profile
    ? profileInfo[profile]?.icon || ZapIcon
    : ZapIcon

  return (
    <div className="px-8 pb-20 max-w-[1600px] mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-900 transition-transform hover:-translate-x-1"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-none mb-1">
            {isNew ? 'Criar Novo Orçamento' : 'Editar Orçamento'}
          </h1>
          <p className="text-sm text-gray-400">
            Preencha os detalhes para gerar sua proposta comercial.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lado Esquerdo: Formulário */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-8 bg-white border border-gray-100 rounded-[24px] shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-1 h-6 bg-brand rounded-full" />
              <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-400">
                Informações do Cliente
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Título do Projeto
                </label>
                <Input
                  value={quote.titulo}
                  onChange={(e) =>
                    setQuote({ ...quote, titulo: e.target.value })
                  }
                  placeholder="Ex: Plataforma E-commerce B2B"
                  className="h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:bg-white transition-all text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Nome do Cliente / Empresa
                </label>
                <Input
                  value={quote.clienteNome}
                  onChange={(e) =>
                    setQuote({ ...quote, clienteNome: e.target.value })
                  }
                  placeholder="Ex: Tech Solutions Inc."
                  className="h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:bg-white transition-all text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Email de Contato
                </label>
                <Input
                  value={quote.clienteEmail}
                  onChange={(e) =>
                    setQuote({ ...quote, clienteEmail: e.target.value })
                  }
                  placeholder="cliente@empresa.com"
                  className="h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:bg-white transition-all text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Sua Hora Técnica (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    R$
                  </span>
                  <Input
                    type="number"
                    value={quote.valorHora}
                    onChange={(e) =>
                      setQuote({ ...quote, valorHora: Number(e.target.value) })
                    }
                    className="pl-11 h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:bg-white transition-all font-mono text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Validade da Proposta
                </label>
                <Input
                  type="date"
                  value={quote.validoAte}
                  onChange={(e) =>
                    setQuote({ ...quote, validoAte: e.target.value })
                  }
                  className="h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:bg-white transition-all text-base"
                />
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white border border-gray-100 rounded-[24px] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-brand rounded-full" />
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-400">
                  Escopo do Projeto
                </h3>
              </div>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-brand text-white hover:bg-brand-dark rounded-xl px-6 h-10 shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 font-semibold">
                    <Plus className="w-4 h-4" />
                    Adicionar Funcionalidades
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[950px] max-h-[90vh] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[32px]">
                  <div className="p-8 pb-4">
                    <DialogHeader className="mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <DialogTitle className="text-2xl font-bold text-gray-900">
                            Catálogo de Funcionalidades
                          </DialogTitle>
                          <p className="text-sm text-gray-400">
                            Selecione os módulos que compõem o escopo do seu
                            projeto.
                          </p>
                        </div>

                        {/* Perfil Ativo Toggle */}
                        <div className="relative">
                          <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-sm transition-all"
                          >
                            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                              <ActiveProfileIcon className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">
                                Perfil Ativo
                              </p>
                              <p className="text-sm font-bold text-gray-900 leading-none">
                                {profile
                                  ? profileInfo[profile]?.name
                                  : 'Selecione um perfil'}
                              </p>
                            </div>
                            {showProfileMenu ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </button>

                          {showProfileMenu && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                              {Object.entries(profileInfo).map(([id, info]) => (
                                <button
                                  key={id}
                                  onClick={() => {
                                    setProfile(id as DevProfile)
                                    setShowProfileMenu(false)
                                  }}
                                  className={cn(
                                    'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                                    profile === id
                                      ? 'bg-brand/5 text-brand'
                                      : 'text-gray-600 hover:bg-gray-50',
                                  )}
                                >
                                  <info.icon className="w-4 h-4" />
                                  <span className="text-sm font-bold">
                                    {info.name}
                                  </span>
                                  {profile === id && (
                                    <Check className="w-4 h-4 ml-auto" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogHeader>

                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <Input
                          placeholder="Pesquisar por nome ou funcionalidade..."
                          className="pl-12 h-14 bg-gray-50 border-none rounded-2xl text-base placeholder:text-gray-300 focus:ring-2 focus:ring-brand/10 transition-all"
                          value={featureSearch}
                          onChange={(e) => setFeatureSearch(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {categories.slice(0, 5).map((cat) => {
                          const isRecommended =
                            profile &&
                            recommendedCategories[profile]?.includes(cat)
                          return (
                            <button
                              key={cat}
                              onClick={() => setActiveCategory(cat)}
                              className={cn(
                                'relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border-2 flex items-center gap-2',
                                activeCategory === cat
                                  ? 'bg-brand border-brand text-white shadow-md shadow-brand/20'
                                  : isRecommended
                                    ? 'bg-brand/5 border-brand/20 text-brand hover:border-brand/40'
                                    : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200',
                              )}
                            >
                              {isRecommended && (
                                <Sparkles className="w-3.5 h-3.5" />
                              )}
                              {cat}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 overflow-hidden min-h-[400px]">
                    {/* Sidebar moderna */}
                    <div className="w-56 bg-gray-50/50 p-6 space-y-1 hidden lg:block overflow-y-auto border-r border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">
                        Categorias
                      </p>
                      {categories.map((cat) => {
                        const Icon = categoryIcons[cat] || ZapIcon
                        const isRecommended =
                          profile &&
                          recommendedCategories[profile]?.includes(cat)
                        return (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all group',
                              activeCategory === cat
                                ? 'bg-white text-brand shadow-sm border border-gray-100'
                                : 'text-gray-500 hover:text-gray-900',
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                className={cn(
                                  'w-4 h-4 transition-colors',
                                  activeCategory === cat
                                    ? 'text-brand'
                                    : 'text-gray-300 group-hover:text-gray-600',
                                )}
                              />
                              {cat}
                            </div>
                            {isRecommended && (
                              <div className="flex items-center text-brand/40">
                                <Sparkles className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {/* Grid de Features Refinado */}
                    <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar bg-white">
                      {filteredFeatures.map((feature) => {
                        const Icon = categoryIcons[feature.categoria] || ZapIcon
                        const isSelected = selectedFeatureIds.includes(
                          feature.id,
                        )
                        const relevant = isRelevant(feature)
                        const hours = getHours(feature)
                        const originalHours = feature.horasEstimadas
                        const hasCustomHours = hours !== originalHours

                        return (
                          <div
                            key={feature.id}
                            onClick={() => {
                              setSelectedFeatureIds((prev) =>
                                prev.includes(feature.id)
                                  ? prev.filter((id) => id !== feature.id)
                                  : [...prev, feature.id],
                              )
                            }}
                            className={cn(
                              'relative p-5 rounded-[20px] border-2 transition-all cursor-pointer group flex flex-col justify-between h-44',
                              isSelected
                                ? 'border-brand bg-brand/5 ring-4 ring-brand/5'
                                : 'border-gray-50 hover:border-gray-200 hover:bg-gray-50/30 shadow-sm',
                              !relevant &&
                                !isSelected &&
                                'opacity-40 grayscale-[0.5] hover:opacity-80 transition-opacity',
                            )}
                          >
                            {!relevant && (
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gray-900 text-[8px] font-black uppercase text-white px-2 py-1 rounded-full border-2 border-white shadow-md z-10 whitespace-nowrap">
                                Fora do seu perfil
                              </div>
                            )}

                            <div className="flex justify-between items-start">
                              <div
                                className={cn(
                                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                                  isSelected
                                    ? 'bg-brand text-white shadow-md shadow-brand/30'
                                    : 'bg-white text-gray-400 border border-gray-100 group-hover:border-brand/20 group-hover:text-brand',
                                )}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div
                                className={cn(
                                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                                  isSelected
                                    ? 'bg-brand border-brand text-white'
                                    : 'bg-white border-gray-200 group-hover:border-brand/50',
                                )}
                              >
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                )}
                              </div>
                            </div>

                            <div className="mt-4">
                              <h4 className="font-bold text-gray-900 truncate text-base mb-1">
                                {feature.nome}
                              </h4>
                              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                {feature.descricao}
                              </p>
                            </div>

                            <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100/50">
                              <span className="text-[10px] font-black uppercase text-gray-300 tracking-tighter">
                                {feature.categoria}
                              </span>
                              <div className="text-right">
                                <div className="flex items-center gap-1.5 text-brand font-bold text-sm">
                                  <Clock className="w-3.5 h-3.5 opacity-60" />
                                  <span>{hours}h</span>
                                </div>
                                {hasCustomHours && (
                                  <p className="text-[9px] text-gray-300 font-bold uppercase tracking-tighter">
                                    {profile ? profile.replace('_', ' ') : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="p-8 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-6">
                    <div className="hidden sm:flex items-center gap-3">
                      <div className="flex -space-x-3">
                        {selectedFeatureIds.slice(0, 4).map((id) => (
                          <div
                            key={id}
                            className="w-10 h-10 rounded-full bg-brand border-4 border-white flex items-center justify-center text-white shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                          </div>
                        ))}
                      </div>
                      {selectedFeatureIds.length > 0 && (
                        <p className="text-sm font-bold text-gray-700">
                          {selectedFeatureIds.length} Itens Selecionados
                        </p>
                      )}
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsModalOpen(false)
                          setSelectedFeatureIds([])
                        }}
                        className="flex-1 sm:flex-none rounded-2xl h-12 px-8 font-semibold text-gray-500"
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="flex-1 sm:flex-none bg-brand text-white hover:bg-brand-dark rounded-2xl h-12 px-10 font-bold shadow-xl shadow-brand/20 transition-all active:scale-95"
                        onClick={handleAddFeatures}
                        disabled={selectedFeatureIds.length === 0}
                      >
                        Confirmar Seleção
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {(quote.itens || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-100 rounded-[24px] bg-gray-50/30">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                    <Zap className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-medium">
                    Nenhuma funcionalidade no escopo
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Clique em adicionar para começar a construir o projeto.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {(quote.itens || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl group hover:border-brand/30 transition-all hover:shadow-md hover:shadow-gray-100/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-light group-hover:text-brand transition-colors">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900 leading-tight">
                            {item.nome}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                              <Clock className="w-3.5 h-3.5" />
                              {item.horas}h estimadas
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4 hidden sm:block">
                          <p className="text-[10px] uppercase font-bold text-gray-300 mb-0.5 tracking-wider">
                            Valor Estimado
                          </p>
                          <p className="text-sm font-mono font-bold text-gray-900">
                            {(
                              item.horas * (quote.valorHora || 0)
                            ).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="w-10 h-10 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-8 bg-white border border-gray-100 rounded-[24px] shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-1 h-6 bg-brand rounded-full" />
              <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-400">
                Ajustes & Condições
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Desconto (%)
                  </label>
                  <Input
                    type="number"
                    value={quote.desconto}
                    onChange={(e) =>
                      setQuote({ ...quote, desconto: Number(e.target.value) })
                    }
                    className="h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:bg-white transition-all font-mono text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Urgência (%)
                  </label>
                  <Input
                    type="number"
                    value={quote.acrescimoUrgencia}
                    onChange={(e) =>
                      setQuote({
                        ...quote,
                        acrescimoUrgencia: Number(e.target.value),
                      })
                    }
                    className="h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:bg-white transition-all font-mono text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Entrada (R$)
                  </label>
                  <Input
                    type="number"
                    value={quote.entrada}
                    onChange={(e) =>
                      setQuote({ ...quote, entrada: Number(e.target.value) })
                    }
                    className="h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:bg-white transition-all font-mono text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Parcelas
                  </label>
                  <Input
                    type="number"
                    value={quote.parcelas}
                    onChange={(e) =>
                      setQuote({ ...quote, parcelas: Number(e.target.value) })
                    }
                    className="h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:bg-white transition-all font-mono text-base"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Notas Internas
              </label>
              <Textarea
                value={quote.notasInternas}
                onChange={(e) =>
                  setQuote({ ...quote, notasInternas: e.target.value })
                }
                placeholder="Observações que não aparecem na proposta..."
                className="min-h-[120px] bg-gray-50/50 border-gray-100 rounded-2xl focus:bg-white transition-all p-4 resize-none"
              />
            </div>
          </Card>

          <div className="flex items-center justify-end gap-4 pb-12">
            <Button
              variant="ghost"
              className="rounded-xl h-14 px-10 font-bold text-gray-400"
              onClick={() => router.push('/orcamentos')}
            >
              Descartar
            </Button>
            <Button
              className="bg-brand text-white hover:bg-brand-dark rounded-2xl h-14 px-12 font-bold shadow-xl shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleSave}
            >
              Gerar Orçamento
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Lado Direito: Resumo (Sticky) */}
        <div className="lg:col-span-4">
          <div className="sticky top-8">
            <Card className="bg-brand-deep text-white border-none rounded-[32px] overflow-hidden shadow-2xl shadow-brand/10">
              <div className="p-8 border-b border-white/5">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-1 h-4 bg-brand-mid rounded-full" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-mid/80">
                    Sumário Executivo
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-brand-light/40 font-medium">
                      Capacidade Alocada
                    </span>
                    <span className="font-mono font-bold text-lg">
                      {totals.totalHoras}h
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-brand-light/80">
                    <span className="text-sm font-medium">Valor Base</span>
                    <span className="font-mono font-bold">
                      {totals.valorBruto.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>

                  {totals.valorDesconto > 0 && (
                    <div className="flex justify-between items-center text-emerald-400 bg-emerald-400/5 px-3 py-2 rounded-lg border border-emerald-400/10">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        <span className="text-xs font-bold uppercase">
                          Desconto Aplicado
                        </span>
                      </div>
                      <span className="font-mono font-bold">
                        -
                        {totals.valorDesconto.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>
                  )}

                  {totals.valorUrgencia > 0 && (
                    <div className="flex justify-between items-center text-orange-400 bg-orange-400/5 px-3 py-2 rounded-lg border border-orange-400/10">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-bold uppercase">
                          Taxa de Urgência
                        </span>
                      </div>
                      <span className="font-mono font-bold">
                        +
                        {totals.valorUrgencia.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-black/20">
                <div className="mb-8">
                  <p className="text-[10px] font-black uppercase text-brand-mid tracking-[0.2em] mb-2 opacity-60">
                    Investimento Total
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-mono font-black tracking-tighter">
                      {totals.totalValor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-2 text-brand-mid mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[10px] uppercase font-black tracking-widest">
                        Entrega
                      </span>
                    </div>
                    <p className="text-base font-bold">
                      {totals.prazoSemanas} Semanas
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-2 text-brand-mid mb-2">
                      <Layers className="w-4 h-4" />
                      <span className="text-[10px] uppercase font-black tracking-widest">
                        Escopo
                      </span>
                    </div>
                    <p className="text-base font-bold">
                      {totals.modulos} Módulos
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-5 bg-brand-dark/20 rounded-3xl border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-brand-light/40 font-bold uppercase tracking-widest">
                      Entrada
                    </span>
                    <span className="font-mono font-bold text-sm">
                      {quote.entrada?.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-brand-light/40 font-bold uppercase tracking-widest">
                      {quote.parcelas}x Parcelas
                    </span>
                    <span className="font-mono font-bold text-sm">
                      {totals.valorParcela.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-brand text-center">
                <div className="flex items-center justify-center gap-2">
                  <Info className="w-3.5 h-3.5 opacity-60" />
                  <p className="text-[10px] text-white uppercase font-bold tracking-widest">
                    Proposta expira em{' '}
                    {new Date(quote.validoAte || '').toLocaleDateString(
                      'pt-BR',
                    )}
                  </p>
                </div>
              </div>
            </Card>

            <div className="mt-6 flex flex-col gap-3">
              <Button className="w-full bg-white text-brand hover:bg-gray-50 h-14 rounded-2xl font-bold gap-3 shadow-xl shadow-black/5 transition-all active:scale-95 border border-gray-100">
                <Calculator className="w-5 h-5 text-brand/40" />
                Simular Cenários
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-gray-600 h-14 rounded-2xl font-semibold transition-all"
                onClick={() => router.push(`/orcamentos/${id}/proposta`)}
                disabled={isNew}
              >
                Visualizar Proposta Final
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
