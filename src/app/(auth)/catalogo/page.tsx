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
import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useScopeFlow } from '@/context/ScopeFlowContext'
import { cn } from '@/lib/utils'

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
];

const categoryIcons: Record<string, React.ElementType> = {
  Autenticação: Lock,
  Dashboard: Layout,
  Pagamentos: CreditCard,
  'E-mail': Mail,
  Upload: Upload,
  CMS: Database,
  API: Globe,
  Integrações: Share2,
  Outro: Zap,
};


export default function CatalogPage() {
  const { features } = useScopeFlow()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todos')

  const filteredFeatures = features.filter((feature) => {
    const matchesSearch =
      feature.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === 'Todos' || feature.categoria === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="px-8 pb-12">
      <header className="flex items-center justify-between h-16 mb-8">
        <h1 className="text-xl font-semibold text-gray-900">
          Catálogo de funcionalidades
        </h1>
        <Button className="bg-brand text-white hover:bg-brand-dark rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova funcionalidade
        </Button>
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
          {categories.map((cat) => (
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
          const Icon = categoryIcons[feature.categoria] || Zap
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
                  {feature.nome}
                </h3>
                <p className="text-[10px] uppercase font-bold text-brand-mid tracking-wider mb-3">
                  {feature.categoria}
                </p>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                  {feature.descricao}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-mono font-semibold text-gray-900">
                    {feature.horasEstimadas}h
                  </span>
                  <span className="text-xs text-gray-400">estimadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500 hover:text-gray-900"
                  >
                    Editar
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
