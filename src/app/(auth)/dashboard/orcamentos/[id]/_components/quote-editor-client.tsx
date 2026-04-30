'use client'

import { toast } from 'sonner'

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
import { useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { useScopeFlow } from '@/context/ScopeFlowContext'
import { useDevProfile } from '@/hooks/useDevProfile'
import { cn } from '@/lib/utils'
import { type DevProfile } from '@/types'
import { ClientModal } from '../../../clientes/_components/client-modal'
import { createQuote } from '../../_actions/create-quote'
import { updateQuote } from '../../_actions/update-quote'

// Mapeamentos e dados mantidos como no original
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

export function QuoteEditorClient({ initialQuote, clients: initialClients }: { initialQuote?: any; clients: any[] }) {
  const router = useRouter()
  const { features, user } = useScopeFlow()
  const { profile, getHours } = useDevProfile()

  const isNew = !initialQuote

  const [quote, setQuote] = useState<any>({
    title: initialQuote?.title || '',
    clientId: initialQuote?.clientId || '',
    status: initialQuote?.status || 'rascunho',
    hourlyRate: initialQuote?.hourlyRate ? Number(initialQuote.hourlyRate) : (user?.valorHora || 150),
    items: (initialQuote?.items || []).map((item: any, index: number) => ({
      ...item,
      order: item.order ?? index
    })),
    discount: initialQuote?.discount ? Number(initialQuote.discount) : 0,
    urgencyFee: initialQuote?.urgencyFee ? Number(initialQuote.urgencyFee) : 0,
    entryAmount: initialQuote?.entryAmount ? Number(initialQuote.entryAmount) : 0,
    installments: initialQuote?.installments || 1,
    expirationDate: initialQuote?.expirationDate ? new Date(initialQuote.expirationDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: initialQuote?.description || '',
  })

  const [clients, setClients] = useState(initialClients)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [featureSearch, setFeatureSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const totals = useMemo(() => {
    const totalHoras = (quote.items || []).reduce(
      (acc: number, item: any) => acc + Number(item.hours),
      0,
    )
    const valorBruto = totalHoras * (quote.hourlyRate || 0)
    const valorDesconto = (valorBruto * (quote.discount || 0)) / 100
    const valorUrgencia = (valorBruto * (quote.urgencyFee || 0)) / 100
    const totalValor = valorBruto - valorDesconto + valorUrgencia
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
      prazoSemanas,
      modulos,
      valorParcela,
    }
  }, [quote])

  const handleAddFeatures = () => {
    const newItems = features
      .filter((f) => selectedFeatureIds.includes(f.id))
      .map((f, index) => ({
        id: `temp-${Date.now()}-${f.id}-${index}`,
        name: f.nome,
        description: f.descricao,
        hours: getHours(f),
        unitValue: getHours(f) * (quote.hourlyRate || 0),
        featureId: f.id,
        order: quote.items.length + index
      }))

    setQuote((prev: any) => ({
      ...prev,
      items: [...(prev.items || []), ...newItems],
    }))
    setIsModalOpen(false)
    setSelectedFeatureIds([])
  }

  const updateItem = (itemId: string, updates: any) => {
    setQuote((prev: any) => ({
      ...prev,
      items: prev.items.map((item: any) => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    }))
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...quote.items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return

    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp

    // Update orders
    const finalItems = newItems.map((item, i) => ({ ...item, order: i }))
    setQuote((prev: any) => ({ ...prev, items: finalItems }))
  }

  const removeItem = (itemId: string) => {
    setQuote((prev: any) => ({
      ...prev,
      items: (prev.items || []).filter((i: any) => i.id !== itemId),
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const finalQuote = {
        ...quote,
        totalHours: totals.totalHoras,
        totalValue: totals.totalValor,
        expirationDate: new Date(quote.expirationDate),
      }

      if (isNew) {
        const res = await createQuote(finalQuote)
        if (!res.success) {
          toast.error(res.error)
          return
        }
        toast.success('Orçamento criado com sucesso!')
        router.push('/dashboard/orcamentos')
      } else {
        const res = await updateQuote({ ...finalQuote, id: initialQuote.id })
        if (!res.success) {
          toast.error(res.error)
          return
        }
        toast.success('Orçamento atualizado com sucesso!')
        router.push('/dashboard/orcamentos')
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar orçamento.')
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="px-8 pb-20 max-w-[1600px] mx-auto">
      <ClientModal 
        open={isClientModalOpen} 
        onOpenChange={setIsClientModalOpen} 
        onSuccess={(client) => {
          setClients(prev => [...prev, client])
          setQuote((prev: any) => ({ ...prev, clientId: client.id }))
        }} 
      />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
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
              Personalize o escopo e as condições comerciais.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={quote.status}
            onChange={(e) => setQuote({ ...quote, status: e.target.value })}
            className="h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="rascunho">Rascunho</option>
            <option value="enviada">Enviada</option>
            <option value="aprovada">Aprovada</option>
            <option value="recusada">Recusada</option>
          </select>
          <Button variant="outline" className="gap-2 rounded-xl">
            <Share2 className="w-4 h-4" /> Compartilhar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                  value={quote.title}
                  onChange={(e) => setQuote({ ...quote, title: e.target.value })}
                  placeholder="Ex: Plataforma E-commerce B2B"
                  className="h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:bg-white transition-all text-base"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Cliente</label>
                  <button onClick={() => setIsClientModalOpen(true)} className="text-brand text-xs font-bold hover:underline">
                    + Novo Cliente
                  </button>
                </div>
                <select 
                  value={quote.clientId || ''}
                  onChange={(e) => setQuote({ ...quote, clientId: e.target.value })}
                  className="w-full h-12 px-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white transition-all text-base outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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
                    value={quote.hourlyRate}
                    onChange={(e) =>
                      setQuote({ ...quote, hourlyRate: Number(e.target.value) })
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
                  value={quote.expirationDate}
                  onChange={(e) => setQuote({ ...quote, expirationDate: e.target.value })}
                  className="h-12 bg-gray-50/50 border-gray-100 rounded-xl focus:bg-white transition-all text-base"
                />
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white border border-gray-100 rounded-[24px] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-brand rounded-full" />
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-400">Escopo do Projeto</h3>
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
                          <DialogTitle className="text-2xl font-bold text-gray-900">Catálogo de Funcionalidades</DialogTitle>
                          <p className="text-sm text-gray-400">Selecione os módulos que compõem o escopo do seu projeto.</p>
                        </div>
                      </div>
                    </DialogHeader>

                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <Input
                          placeholder="Pesquisar..."
                          className="pl-12 h-14 bg-gray-50 border-none rounded-2xl text-base"
                          value={featureSearch}
                          onChange={(e) => setFeatureSearch(e.target.value)}
                        />
                      </div>
                      <select 
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value)}
                        className="h-14 px-4 bg-gray-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand min-w-[200px]"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-1 overflow-hidden min-h-[400px]">
                    <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar bg-white">
                      {filteredFeatures.map((feature) => {
                        const isSelected = selectedFeatureIds.includes(feature.id)
                        const hours = getHours(feature)

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
                              isSelected ? 'border-brand bg-brand/5' : 'border-gray-50 hover:border-gray-200 hover:bg-gray-50/30'
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center', isSelected ? 'bg-brand border-brand' : 'border-gray-200')}>
                                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                              </div>
                            </div>
                            <div className="mt-4">
                              <h4 className="font-bold text-gray-900 truncate">{feature.nome}</h4>
                              <p className="text-xs text-gray-400 line-clamp-2">{feature.descricao}</p>
                            </div>
                            <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between">
                              <span className="text-[10px] text-gray-300 uppercase">{feature.categoria}</span>
                              <span className="text-brand font-bold text-sm">{hours}h</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="p-8 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-4">
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                    <Button className="bg-brand text-white hover:bg-brand-dark" onClick={handleAddFeatures} disabled={selectedFeatureIds.length === 0}>
                      Adicionar {selectedFeatureIds.length} {selectedFeatureIds.length === 1 ? 'item' : 'itens'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {(quote.items || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-100 rounded-[24px] bg-gray-50/30">
                  <Layers className="w-12 h-12 text-gray-200 mb-4" />
                  <p className="text-gray-400 font-medium text-center max-w-[200px]">Adicione funcionalidades do seu catálogo para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(quote.items || []).map((item: any, index: number) => (
                    <div key={item.id} className="group flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-brand/30 hover:shadow-md hover:shadow-brand/5 transition-all">
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-1 text-gray-300 hover:text-brand disabled:opacity-0">
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => moveItem(index, 'down')} disabled={index === quote.items.length - 1} className="p-1 text-gray-300 hover:text-brand disabled:opacity-0">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-8">
                          <input 
                            value={item.name}
                            onChange={(e) => updateItem(item.id, { name: e.target.value })}
                            className="w-full font-bold text-gray-900 bg-transparent border-none outline-none focus:text-brand"
                          />
                          <p className="text-xs text-gray-400 truncate">{item.description || 'Sem descrição'}</p>
                        </div>
                        <div className="md:col-span-3 flex items-center gap-2">
                          <div className="relative w-24">
                            <input 
                              type="number"
                              value={item.hours}
                              onChange={(e) => updateItem(item.id, { hours: Number(e.target.value) })}
                              className="w-full h-9 pl-3 pr-7 bg-gray-50 border-none rounded-lg text-sm font-mono font-bold text-gray-700 outline-none focus:ring-1 focus:ring-brand"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">h</span>
                          </div>
                          <span className="text-xs text-gray-300">x R$ {quote.hourlyRate}</span>
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
              <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-400">Ajustes & Condições</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50/50 rounded-[20px]">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Desconto (%)</label>
                  <Input type="number" value={quote.discount} onChange={(e) => setQuote({ ...quote, discount: Number(e.target.value) })} className="h-12 bg-white border-gray-100" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Urgência (%)</label>
                  <Input type="number" value={quote.urgencyFee} onChange={(e) => setQuote({ ...quote, urgencyFee: Number(e.target.value) })} className="h-12 bg-white border-gray-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-6 bg-brand/5 rounded-[20px]">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-dark uppercase ml-1">Entrada (R$)</label>
                  <Input type="number" value={quote.entryAmount} onChange={(e) => setQuote({ ...quote, entryAmount: Number(e.target.value) })} className="h-12 bg-white border-brand/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-dark uppercase ml-1">Parcelas</label>
                  <Input type="number" value={quote.installments} onChange={(e) => setQuote({ ...quote, installments: Number(e.target.value) })} className="h-12 bg-white border-brand/10" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Notas Internas / Observações</label>
              <Textarea value={quote.description} onChange={(e) => setQuote({ ...quote, description: e.target.value })} placeholder="Detalhes que não aparecem na proposta..." className="min-h-[120px] bg-gray-50/50 border-gray-100 rounded-xl" />
            </div>
          </Card>

          <div className="flex justify-end gap-4 pb-12">
            <Button variant="ghost" onClick={() => router.push('/dashboard/orcamentos')} className="h-14 px-10 text-gray-400">Descartar</Button>
            <Button disabled={loading || quote.items.length === 0} onClick={handleSave} className="bg-brand text-white hover:bg-brand-dark h-14 px-12 rounded-2xl shadow-xl shadow-brand/20 transition-all hover:scale-[1.02]">
              {loading ? 'Salvando...' : 'Finalizar Orçamento'} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-8 space-y-4">
            <Card className="bg-gray-900 text-white border-none rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/5">
                <div className="flex items-center gap-2 mb-8">
                  <Calculator className="w-4 h-4 text-brand" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Resumo Financeiro</h3>
                </div>
                
                <div className="space-y-5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Subtotal de Horas</span>
                    <span className="font-mono font-bold">{totals.totalHoras}h</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Valor Bruto</span>
                    <span className="font-mono">{totals.valorBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  
                  {quote.discount > 0 && (
                    <div className="flex justify-between items-center text-sm text-red-400">
                      <span>Desconto ({quote.discount}%)</span>
                      <span className="font-mono">- {totals.valorDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  )}
                  
                  {quote.urgencyFee > 0 && (
                    <div className="flex justify-between items-center text-sm text-brand">
                      <span>Taxa de Urgência ({quote.urgencyFee}%)</span>
                      <span className="font-mono">+ {totals.valorUrgencia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-8 bg-black/40">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Investimento Total</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-mono font-black">{totals.totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>
              </div>

              {quote.installments > 1 && (
                <div className="px-8 py-6 bg-brand/10 border-t border-brand/10">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-brand uppercase">Condição de Pagamento</span>
                      <span className="text-xs text-gray-400">Entrada + {quote.installments}x de</span>
                    </div>
                    <span className="text-lg font-mono font-bold text-brand">{totals.valorParcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6 bg-white border border-gray-100 rounded-[24px]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Prazo Estimado</p>
                    <p className="text-sm font-bold text-gray-900">{totals.prazoSemanas} {totals.prazoSemanas === 1 ? 'semana' : 'semanas'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Validade</p>
                    <p className="text-sm font-bold text-gray-900">{new Date(quote.expirationDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
