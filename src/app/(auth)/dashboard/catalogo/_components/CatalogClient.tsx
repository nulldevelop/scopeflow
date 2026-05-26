'use client'

import {
  Check,
  CreditCard,
  Database,
  Edit2,
  Globe,
  Layout,
  Library,
  Lock,
  Mail,
  Monitor,
  Plus,
  Rocket,
  Search,
  Settings2,
  Share2,
  Smartphone,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/shared/Header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { cn } from '@/lib/utils'
import { defaultFeatures } from '../../../../../../prisma/seed-data'
import { createCategoryAction } from '../_actions/create-category'
import { createFeatureAction } from '../_actions/create-feature'
import { deleteCategoryAction } from '../_actions/delete-category'
import { deleteFeatureAction } from '../_actions/delete-feature'
import { initializeDefaultsAction } from '../_actions/initialize-defaults'
import { updateCategoryAction } from '../_actions/update-category'
import { updateFeatureAction } from '../_actions/update-feature'

export interface CatalogCategory {
  id: string
  name: string
}

export interface CatalogFeature {
  id: string
  name: string
  description: string | null
  baseHours: number
  complexity: string
  monthlyFee: number
  monthlyDuration: number
  categoryId: string | null
  category: CatalogCategory | null
}

interface CatalogClientProps {
  initialFeatures: CatalogFeature[]
  categories: CatalogCategory[]
}

const categoryIcons: Record<string, React.ElementType> = {
  Autenticação: Lock,
  Dashboard: Layout,
  'Dashboard & Interface': Layout,
  Pagamentos: CreditCard,
  'Pagamentos & Assinaturas': CreditCard,
  'E-mail': Mail,
  'E-mail & Notificações': Mail,
  Upload: Upload,
  'Arquivos & Upload': Upload,
  CMS: Database,
  'CMS & Conteúdo': Database,
  API: Globe,
  'API & Integrações': Globe,
  Integrações: Share2,
  'Sites & Landing Pages': Monitor,
  'Marketing & SEO': Rocket,
  'Segurança & Auditoria': Lock,
  'Mobile & PWA': Smartphone,
}

export function CatalogClient({
  initialFeatures,
  categories,
}: CatalogClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Modais
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<CatalogFeature | null>(
    null,
  )

  // Initialize Defaults Modal
  const [initializeModalOpen, setInitializeModalOpen] = useState(false)
  const [initStep, setInitStep] = useState(1)
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<any[]>([])

  // Category management
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  )
  const [editingCategoryName, setEditingCategoryName] = useState('')

  const filteredFeatures = initialFeatures.filter((feature) => {
    const matchesSearch = feature.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || feature.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleProfileToggle = (id: string) => {
    setSelectedProfiles((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  const handleNextStep = () => {
    // Para simplificar, quando o usuário seleciona perfis, adicionamos as features base.
    // Como defaultFeatures é um array plano, pegamos todas ou filtramos por categorias.
    // Aqui pegamos todas para permitir a revisão no Passo 2.
    const features: any[] = defaultFeatures.map((feat: any, index: number) => ({
      id: String(index),
      nome: feat.name,
      descricao: feat.description,
      horasEstimadas: feat.baseHours,
      categoria: feat.categoryName,
    }))

    setSelectedFeatures(features)
    setInitStep(2)
  }

  const handleInitialize = async () => {
    startTransition(async () => {
      const res = await initializeDefaultsAction({
        selectedFeatures: selectedFeatures.map((f: any) => f.nome),
      })
      if (res.success) {
        toast.success('Catálogo inicializado com sucesso!')
        setInitializeModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deleteFeatureAction(id)
      if (res.success) {
        toast.success('Funcionalidade removida!')
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleUpdateCategory = async (id: string) => {
    startTransition(async () => {
      const res = await updateCategoryAction(id, editingCategoryName)
      if (res.success) {
        toast.success('Categoria atualizada!')
        setEditingCategoryId(null)
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDeleteCategory = async (id: string) => {
    startTransition(async () => {
      const res = await deleteCategoryAction(id)
      if (res.success) {
        toast.success('Categoria excluída!')
      } else {
        toast.error(res.error)
      }
    })
  }

  const FeatureModal = ({
    open,
    setOpen,
    initialData,
  }: {
    open: boolean
    setOpen: (o: boolean) => void
    initialData?: CatalogFeature | null
  }) => {
    const [name, setName] = useState(initialData?.name || '')
    const [description, setDescription] = useState(
      initialData?.description || '',
    )
    const [baseHours, setBaseHours] = useState(
      initialData?.baseHours.toString() || '0',
    )
    const [complexity, setComplexity] = useState(
      initialData?.complexity || 'media',
    )
    const [monthlyFee, setMonthlyFee] = useState(
      initialData?.monthlyFee.toString() || '0',
    )
    const [monthlyDuration, setMonthlyDuration] = useState(
      initialData?.monthlyDuration.toString() || '12',
    )
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')

    const handleSave = async () => {
      startTransition(async () => {
        const data = {
          name,
          description,
          baseHours: Number(baseHours),
          complexity,
          monthlyFee: Number(monthlyFee),
          monthlyDuration: Number(monthlyDuration),
          categoryId: categoryId || null,
        }

        const res = initialData
          ? await updateFeatureAction(initialData.id, data)
          : await createFeatureAction(data)

        if (res.success) {
          toast.success(
            initialData ? 'Atualizado com sucesso!' : 'Criado com sucesso!',
          )
          setOpen(false)
        } else {
          toast.error(res.error)
        }
      })
    }

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {initialData ? 'Editar Item' : 'Novo Item no Catálogo'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Autenticação Social"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="O que está incluso nesta funcionalidade?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Horas Base</Label>
                <Input
                  type="number"
                  value={baseHours}
                  onChange={(e) => setBaseHours(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Complexidade</Label>
                <Select value={complexity} onValueChange={setComplexity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mensalidade (R$)</Label>
                <Input
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Duração (Meses)</Label>
                <Input
                  type="number"
                  value={monthlyDuration}
                  onChange={(e) => setMonthlyDuration(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar no Catálogo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3]">
      <Header
        title="Catálogo"
        subtitle="Gerencie módulos, horas e valores que compõem seus orçamentos"
        icon={Library}
      >
        <Dialog
          open={initializeModalOpen}
          onOpenChange={(val) => {
            setInitializeModalOpen(val)
            if (!val) {
              setInitStep(1)
              setSelectedProfiles([])
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="rounded-xl text-white/70 hover:text-white hover:bg-white/10 border border-white/10 gap-2 h-11 px-5"
            >
              <Zap className="w-4 h-4" />
              Inicializar Padrões
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <DialogTitle className="text-xl font-bold">
                  Personalizar Catálogo
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-1">
                  Passo {initStep} de 2:{' '}
                  {initStep === 1
                    ? 'Escolha seus perfis'
                    : 'Refine as funcionalidades'}
                </p>
              </div>
              <div className="flex gap-1">
                <div
                  className={cn(
                    'w-8 h-1.5 rounded-full transition-colors',
                    initStep >= 1 ? 'bg-brand' : 'bg-gray-200',
                  )}
                />
                <div
                  className={cn(
                    'w-8 h-1.5 rounded-full transition-colors',
                    initStep >= 2 ? 'bg-brand' : 'bg-gray-200',
                  )}
                />
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto no-scrollbar">
              {initStep === 1 ? (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      id: 'frontend',
                      name: 'Frontend',
                      desc: 'Interfaces, Dashboards e CMS',
                      icon: Monitor,
                      color: 'text-blue-500',
                      bg: 'bg-blue-50',
                    },
                    {
                      id: 'backend',
                      name: 'Backend',
                      desc: 'APIs, Segurança e Infra',
                      icon: Database,
                      color: 'text-orange-500',
                      bg: 'bg-orange-50',
                    },
                    {
                      id: 'saas',
                      name: 'SaaS / Full Stack',
                      desc: 'Tudo incluso: Pagamentos, S3, etc',
                      icon: Rocket,
                      color: 'text-brand',
                      bg: 'bg-brand/10',
                    },
                    {
                      id: 'mobile',
                      name: 'Mobile',
                      desc: 'Apps, PWA e Sincronização',
                      icon: Smartphone,
                      color: 'text-purple-500',
                      bg: 'bg-purple-50',
                    },
                  ].map((profile) => {
                    const isSelected = selectedProfiles.includes(profile.id)
                    const Icon = profile.icon
                    return (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => handleProfileToggle(profile.id)}
                        className={cn(
                          'flex flex-col items-start gap-3 p-5 rounded-2xl border-2 transition-all text-left group',
                          isSelected
                            ? 'border-brand bg-brand/5 shadow-sm ring-1 ring-brand/20'
                            : 'border-gray-100 hover:border-gray-200 bg-white',
                        )}
                      >
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-active:scale-95',
                            profile.bg,
                          )}
                        >
                          <Icon className={cn('w-6 h-6', profile.color)} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {profile.name}
                          </p>
                          <p className="text-[10px] text-gray-400 leading-tight mt-1">
                            {profile.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedFeatures.map((f, idx) => (
                    <div
                      key={`${f.name}-${idx}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center">
                          <Check className="w-4 h-4 text-brand" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {f.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {f.baseHours} horas • {f.categoryName}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50"
                        onClick={() => {
                          setSelectedFeatures((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="p-4 bg-gray-50 border-t border-gray-100 sm:justify-between items-center">
              <p className="text-[10px] text-gray-400 font-medium">
                {initStep === 1
                  ? 'Escolha ao menos um perfil para continuar'
                  : `${selectedFeatures.length} funcionalidades selecionadas`}
              </p>
              <div className="flex gap-2">
                {initStep === 2 && (
                  <Button
                    variant="outline"
                    onClick={() => setInitStep(1)}
                    className="rounded-xl"
                  >
                    Voltar
                  </Button>
                )}
                <Button
                  onClick={initStep === 1 ? handleNextStep : handleInitialize}
                  disabled={
                    isPending ||
                    (initStep === 1 && selectedProfiles.length === 0)
                  }
                  className="bg-brand hover:bg-brand-dark text-white rounded-xl px-8"
                >
                  {isPending
                    ? 'Iniciando...'
                    : initStep === 1
                      ? 'Continuar'
                      : 'Finalizar e Gerar'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          onClick={() => {
            setEditingFeature(null)
            setIsFeatureModalOpen(true)
          }}
          className="bg-white text-gray-900 hover:bg-gray-50 rounded-xl flex items-center gap-2 h-11 px-5 font-medium transition-all shadow-lg shadow-brand/10"
        >
          <Plus className="w-4 h-4" />
          Novo Item
        </Button>
      </Header>

      <div className="px-8 -mt-14 relative z-10 pb-12">
        <div className="max-w-[1600px] mx-auto">
          {/* Categorias */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar">
            <Button
              onClick={() => setCategoryFilter('all')}
              variant={categoryFilter === 'all' ? 'default' : 'outline'}
              className={cn(
                'rounded-full text-xs font-bold transition-all px-6',
                categoryFilter !== 'all' &&
                  'bg-white text-gray-500 hover:bg-gray-50',
              )}
            >
              Todos
            </Button>
            {categories.map((cat) => (
              <div key={cat.id} className="relative group">
                <Button
                  onClick={() => setCategoryFilter(cat.id)}
                  variant={categoryFilter === cat.id ? 'default' : 'outline'}
                  className={cn(
                    'rounded-full text-xs font-bold transition-all px-6',
                    categoryFilter !== cat.id &&
                      'bg-white text-gray-500 hover:bg-gray-50',
                  )}
                >
                  {cat.name}
                </Button>
                <div className="absolute -top-2 -right-2 hidden group-hover:flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-6 h-6 rounded-full bg-white shadow-sm"
                    onClick={() => {
                      setEditingCategoryId(cat.id)
                      setEditingCategoryName(cat.name)
                    }}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-6 h-6 rounded-full bg-white shadow-sm text-red-500"
                    onClick={() => handleDeleteCategory(cat.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full w-10 h-10 p-0 border-dashed border-gray-300 text-gray-400 hover:text-brand hover:border-brand"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Nova Categoria</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Nome da Categoria</Label>
                    <Input
                      placeholder="Ex: Integrações"
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    className="bg-brand text-white"
                    onClick={async () => {
                      startTransition(async () => {
                        const res =
                          await createCategoryAction(editingCategoryName)
                        if (res.success) {
                          toast.success('Categoria criada!')
                          setEditingCategoryName('')
                        } else {
                          toast.error(res.error)
                        }
                      })
                    }}
                  >
                    Criar Categoria
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar funcionalidade..."
                className="pl-10 bg-white border-gray-200 rounded-lg h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Grid de Itens */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <FeatureModal
              open={isFeatureModalOpen}
              setOpen={setIsFeatureModalOpen}
              initialData={editingFeature}
            />

            {filteredFeatures.map((feature) => {
              const Icon =
                categoryIcons[feature.category?.name || ''] || Settings2
              return (
                <Card
                  key={feature.id}
                  className="p-6 bg-white border border-gray-200 rounded-[28px] hover:border-brand/20 hover:shadow-xl hover:shadow-brand/5 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand/[0.03] to-transparent rounded-bl-full" />
                  <div className="relative flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-2xl flex items-center justify-center transition-colors',
                          'bg-gray-50 text-gray-400 group-hover:bg-brand-light group-hover:text-brand',
                        )}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="mb-6 flex-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-brand transition-colors mb-1">
                        {feature.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 line-clamp-2 min-h-[30px]">
                        {feature.description ||
                          'Sem descrição disponível para este item.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                            Horas
                          </span>
                          <span className="text-sm font-mono font-black text-gray-900">
                            {feature.baseHours}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg',
                            feature.complexity === 'baixa'
                              ? 'bg-green-50 text-green-600'
                              : feature.complexity === 'alta'
                                ? 'bg-red-50 text-red-500'
                                : 'bg-orange-50 text-orange-500',
                          )}
                        >
                          {feature.complexity}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-full text-gray-400 hover:text-brand hover:bg-brand/10 transition-all"
                          onClick={() => {
                            setEditingFeature(feature)
                            setIsFeatureModalOpen(true)
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          onClick={() => handleDelete(feature.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-4 rounded-full text-[9px] font-black uppercase border-brand/30 text-brand hover:bg-brand hover:text-white hover:border-brand transition-all ml-1"
                          onClick={() =>
                            router.push(
                              `/dashboard/orcamentos/novo?featureId=${feature.id}`,
                            )
                          }
                        >
                          Usar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}

            {filteredFeatures.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50/50">
                <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm mb-4">
                  <Search className="w-6 h-6 text-gray-200" />
                </div>
                <p className="text-gray-400 font-medium">
                  Nenhuma funcionalidade encontrada
                </p>
                <p className="text-xs text-gray-300">
                  Tente ajustar seus filtros ou busca
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
