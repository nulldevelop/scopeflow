'use client'

import {
  CreditCard,
  Database,
  Globe,
  Layout,
  Lock,
  Mail,
  Plus,
  Search,
  Share2,
  Upload,
  Zap,
  Settings2,
  Trash2,
  Edit2,
  Check,
  X,
} from 'lucide-react'
import type React from 'react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { createFeatureAction } from '../_actions/create-feature'
import { deleteFeatureAction } from '../_actions/delete-feature'
import { updateFeatureAction } from '../_actions/update-feature'
import { createCategoryAction } from '../_actions/create-category'
import { updateCategoryAction } from '../_actions/update-category'
import { deleteCategoryAction } from '../_actions/delete-category'

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
  categoryId: string | null
  category: CatalogCategory | null
}

interface CatalogClientProps {
  initialFeatures: CatalogFeature[]
  categories: CatalogCategory[]
}

const categoryIcons: Record<string, React.ElementType> = {
  Autenticacao: Lock,
  Dashboard: Layout,
  Pagamentos: CreditCard,
  'E-mail': Mail,
  Upload: Upload,
  CMS: Database,
  API: Globe,
  Integracoes: Share2,
  Outro: Zap,
}

export default function CatalogClient({
  initialFeatures,
  categories,
}: CatalogClientProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todos')
  const [isPending, startTransition] = useTransition()

  // Feature States
  const [open, setOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<CatalogFeature | null>(
    null,
  )

  // Category States
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  )
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [quickCreateCategory, setQuickCreateCategory] = useState(false)

  const filteredFeatures = initialFeatures.filter((feature) => {
    const matchesSearch =
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (feature.description?.toLowerCase() || '').includes(
        searchTerm.toLowerCase(),
      )
    const matchesCategory =
      categoryFilter === 'Todos' || feature.category?.name === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      baseHours: Number(formData.get('baseHours')),
      complexity: formData.get('complexity') as string,
      categoryId:
        formData.get('categoryId') === 'none'
          ? null
          : (formData.get('categoryId') as string),
    }

    startTransition(async () => {
      try {
        let res
        if (editingFeature) {
          res = await updateFeatureAction(editingFeature.id, data)
        } else {
          res = await createFeatureAction(data)
        }

        if (res.success) {
          toast.success(
            editingFeature
              ? 'Funcionalidade atualizada!'
              : 'Funcionalidade criada!',
          )
          setOpen(false)
          setEditingFeature(null)
        } else {
          toast.error(res.error)
        }
      } catch (error) {
        toast.error('Ocorreu um erro inesperado.')
      }
    })
  }

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        const res = await deleteFeatureAction(id)
        if (res.success) {
          toast.success('Funcionalidade excluída!')
        } else {
          toast.error(res.error)
        }
      } catch (error) {
        toast.error('Erro ao excluir funcionalidade.')
      }
    })
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    startTransition(async () => {
      const res = await createCategoryAction(newCategoryName)
      if (res.success) {
        toast.success('Categoria criada!')
        setNewCategoryName('')
        setQuickCreateCategory(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleUpdateCategory = async (id: string) => {
    if (!editingCategoryName.trim()) return
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

  return (
    <div className="px-8 pb-12">
      <header className="flex items-center justify-between h-16 mb-8">
        <h1 className="text-xl font-semibold text-gray-900">
          Catálogo de funcionalidades
        </h1>
        <div className="flex items-center gap-3">
          <Dialog
            open={categoryDialogOpen}
            onOpenChange={setCategoryDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="rounded-lg flex items-center gap-2 border-gray-200"
              >
                <Settings2 className="w-4 h-4 text-gray-400" />
                Categorias
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Gerenciar Categorias</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nova categoria..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Button
                    onClick={handleCreateCategory}
                    disabled={isPending || !newCategoryName.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 group"
                    >
                      {editingCategoryId === cat.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editingCategoryName}
                            onChange={(e) =>
                              setEditingCategoryName(e.target.value)
                            }
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateCategory(cat.id)}
                            className="text-brand"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingCategoryId(null)}
                            className="text-gray-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-medium text-gray-700">
                            {cat.name}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingCategoryId(cat.id)
                                setEditingCategoryName(cat.name)
                              }}
                              className="p-1 text-gray-400 hover:text-brand"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={open}
            onOpenChange={(val) => {
              setOpen(val)
              if (!val) {
                setEditingFeature(null)
                setQuickCreateCategory(false)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-brand text-white hover:bg-brand-dark rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova funcionalidade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingFeature ? 'Editar' : 'Nova'} Funcionalidade
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs font-bold uppercase text-gray-400 tracking-wider"
                  >
                    Nome
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Sistema de Login"
                    defaultValue={editingFeature?.name}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-xs font-bold uppercase text-gray-400 tracking-wider"
                  >
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva o que esta funcionalidade contempla..."
                    defaultValue={editingFeature?.description || ''}
                    className="min-h-[100px] rounded-xl resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="baseHours"
                      className="text-xs font-bold uppercase text-gray-400 tracking-wider"
                    >
                      Horas Base
                    </Label>
                    <div className="relative">
                      <Input
                        id="baseHours"
                        name="baseHours"
                        type="number"
                        step="0.5"
                        defaultValue={editingFeature?.baseHours?.toString()}
                        className="h-11 rounded-xl pr-8"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                        h
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="complexity"
                      className="text-xs font-bold uppercase text-gray-400 tracking-wider"
                    >
                      Complexidade
                    </Label>
                    <Select
                      name="complexity"
                      defaultValue={editingFeature?.complexity || 'media'}
                    >
                      <SelectTrigger className="h-11 rounded-xl capitalize">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <Label
                      htmlFor="categoryId"
                      className="text-xs font-bold uppercase text-gray-400 tracking-wider"
                    >
                      Categoria
                    </Label>
                    <button
                      type="button"
                      onClick={() =>
                        setQuickCreateCategory(!quickCreateCategory)
                      }
                      className="text-[10px] font-bold text-brand hover:underline"
                    >
                      {quickCreateCategory ? 'Cancelar' : '+ Nova Categoria'}
                    </button>
                  </div>

                  {quickCreateCategory ? (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                      <Input
                        placeholder="Nome da categoria..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="h-11 rounded-xl"
                        autoFocus
                      />
                      <Button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={isPending || !newCategoryName.trim()}
                        className="h-11 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        Criar
                      </Button>
                    </div>
                  ) : (
                    <Select
                      name="categoryId"
                      defaultValue={editingFeature?.categoryId || 'none'}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem categoria</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-brand hover:bg-brand-dark rounded-xl text-white font-bold shadow-lg shadow-brand/10 transition-all active:scale-[0.98]"
                    disabled={isPending}
                  >
                    {isPending
                      ? 'Processando...'
                      : editingFeature
                        ? 'Salvar Alterações'
                        : 'Criar Funcionalidade'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou descrição..."
            className="pl-11 bg-white border-gray-100 rounded-xl h-12 shadow-sm focus:ring-brand"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['Todos', ...categories.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border-2',
                categoryFilter === cat
                  ? 'bg-brand border-brand text-white shadow-md shadow-brand/20'
                  : 'bg-white text-gray-400 border-transparent hover:border-gray-100 hover:text-gray-600',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFeatures.map((feature) => {
          const Icon = categoryIcons[feature.category?.name || ''] || Zap
          return (
            <Card
              key={feature.id}
              className="group p-6 bg-white border border-gray-100 rounded-[24px] hover:border-brand/20 hover:shadow-xl hover:shadow-brand/5 transition-all flex flex-col relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 transition-colors group-hover:bg-brand-light">
                <Icon className="w-6 h-6 text-gray-400 group-hover:text-brand" />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-brand transition-colors">
                    {feature.name}
                  </h3>
                </div>
                <p className="text-[10px] uppercase font-black text-gray-300 tracking-widest mb-4 group-hover:text-brand/60 transition-colors">
                  {feature.category?.name || 'Sem Categoria'}
                </p>
                <p className="text-sm text-gray-500 mb-8 line-clamp-3 leading-relaxed">
                  {feature.description ||
                    'Nenhuma descrição fornecida para esta funcionalidade.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-300 uppercase">
                    Esforço
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono font-black text-gray-900">
                      {feature.baseHours}h
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full text-gray-400 hover:text-brand hover:bg-brand-light"
                    onClick={() => {
                      setEditingFeature(feature)
                      setOpen(true)
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Excluir esta funcionalidade?'))
                        handleDelete(feature.id)
                    }}
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-[10px] font-black uppercase border-brand text-brand hover:bg-brand hover:text-white transition-all ml-1"
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
  )
}
