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
} from 'lucide-react'
import type React from 'react'
import { useState, useTransition } from 'react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todos')
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<CatalogFeature | null>(
    null,
  )

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
      categoryId: (formData.get('categoryId') as string) || null,
    }

    startTransition(async () => {
      try {
        if (editingFeature) {
          await updateFeatureAction(editingFeature.id, data)
        } else {
          await createFeatureAction(data)
        }
        setOpen(false)
        setEditingFeature(null)
      } catch (error) {
        console.error(error)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta funcionalidade?')) {
      startTransition(async () => {
        try {
          await deleteFeatureAction(id)
        } catch (error) {
          console.error(error)
        }
      })
    }
  }

  return (
    <div className="px-8 pb-12">
      <header className="flex items-center justify-between h-16 mb-8">
        <h1 className="text-xl font-semibold text-gray-900">
          Catalogo de funcionalidades
        </h1>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val)
            if (!val) setEditingFeature(null)
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-brand text-white hover:bg-brand-dark rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova funcionalidade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFeature ? 'Editar' : 'Nova'} Funcionalidade
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingFeature?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descricao</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingFeature?.description || ''}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseHours">Horas Base</Label>
                  <Input
                    id="baseHours"
                    name="baseHours"
                    type="number"
                    step="0.5"
                    defaultValue={editingFeature?.baseHours?.toString()}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complexity">Complexidade</Label>
                  <Select
                    name="complexity"
                    defaultValue={editingFeature?.complexity || 'media'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria</Label>
                <Select
                  name="categoryId"
                  defaultValue={editingFeature?.categoryId || ''}
                >
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
              <Button
                type="submit"
                className="w-full bg-brand hover:bg-brand-dark"
                disabled={isPending}
              >
                {isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar funcionalidades..."
            className="pl-10 bg-white border-gray-200 rounded-lg h-11"
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
                'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                categoryFilter === cat
                  ? 'bg-brand text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map((feature) => {
          const Icon = categoryIcons[feature.category?.name || ''] || Zap
          return (
            <Card
              key={feature.id}
              className="p-6 bg-white border border-gray-200 rounded-[14px] hover:border-brand/30 transition-all flex flex-col"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-gray-400" />
              </div>

              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {feature.name}
                </h3>
                <p className="text-[10px] uppercase font-bold text-brand-mid tracking-wider mb-3">
                  {feature.category?.name || 'Sem Categoria'}
                </p>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                  {feature.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-mono font-semibold text-gray-900">
                    {feature.baseHours}h
                  </span>
                  <span className="text-xs text-gray-400">estimadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500 hover:text-gray-900"
                    onClick={() => {
                      setEditingFeature(feature)
                      setOpen(true)
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(feature.id)}
                    disabled={isPending}
                  >
                    Excluir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-brand text-brand hover:bg-brand-light"
                  >
                    Usar
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
