'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useScopeFlow } from '@/context/ScopeFlowContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import {
  Plus,
  Trash2,
  ChevronLeft,
  Search,
  Check,
  Calculator,
  Calendar,
  Clock,
  Layers,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Quote, QuoteItem, Feature } from '@/types'
import { cn } from '@/lib/utils'

export default function QuoteEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { quotes, features, user, updateQuote, addQuote } = useScopeFlow()

  const id = params.id as string
  const isNew = id === 'novo'

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
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([])

  useEffect(() => {
    if (!isNew) {
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
    const prazoSemanas = Math.ceil(totalHoras / 20) // Média de 20h/semana
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
        horas: f.horasEstimadas,
        valorUnitario: f.horasEstimadas * (quote.valorHora || 0),
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

  return (
    <div className="px-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">
          {isNew ? 'Novo orçamento' : 'Editar orçamento'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Panel: Form */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="p-6 bg-white border border-gray-200 rounded-[14px]">
            <div className="section-label mb-6">Informações Gerais</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase">
                  Título do projeto
                </label>
                <Input
                  value={quote.titulo}
                  onChange={(e) =>
                    setQuote({ ...quote, titulo: e.target.value })
                  }
                  placeholder="Ex: App de Gestão"
                  className="h-11 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase">
                  Nome do cliente
                </label>
                <Input
                  value={quote.clienteNome}
                  onChange={(e) =>
                    setQuote({ ...quote, clienteNome: e.target.value })
                  }
                  placeholder="Ex: Empresa XYZ"
                  className="h-11 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase">
                  Email do cliente
                </label>
                <Input
                  value={quote.clienteEmail}
                  onChange={(e) =>
                    setQuote({ ...quote, clienteEmail: e.target.value })
                  }
                  placeholder="exemplo@email.com"
                  className="h-11 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase">
                    Valor/hora (R$)
                  </label>
                  <Input
                    type="number"
                    value={quote.valorHora}
                    onChange={(e) =>
                      setQuote({ ...quote, valorHora: Number(e.target.value) })
                    }
                    className="h-11 rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase">
                    Válido até
                  </label>
                  <Input
                    type="date"
                    value={quote.validoAte}
                    onChange={(e) =>
                      setQuote({ ...quote, validoAte: e.target.value })
                    }
                    className="h-11 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 rounded-[14px]">
            <div className="flex items-center justify-between mb-6">
              <div className="section-label">Funcionalidades Selecionadas</div>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-brand text-brand hover:bg-brand-light gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Catálogo de funcionalidades</DialogTitle>
                  </DialogHeader>
                  <div className="relative my-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome ou categoria..."
                      className="pl-10 h-11"
                      value={featureSearch}
                      onChange={(e) => setFeatureSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-2 min-h-[300px]">
                    {features
                      .filter(
                        (f) =>
                          f.nome
                            .toLowerCase()
                            .includes(featureSearch.toLowerCase()) ||
                          f.categoria
                            .toLowerCase()
                            .includes(featureSearch.toLowerCase()),
                      )
                      .map((feature) => (
                        <div
                          key={feature.id}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:bg-gray-50',
                            selectedFeatureIds.includes(feature.id)
                              ? 'border-brand bg-brand-light/50'
                              : 'border-gray-100',
                          )}
                          onClick={() => {
                            setSelectedFeatureIds((prev) =>
                              prev.includes(feature.id)
                                ? prev.filter((id) => id !== feature.id)
                                : [...prev, feature.id],
                            )
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedFeatureIds.includes(feature.id)}
                              className="border-gray-300 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {feature.nome}
                              </p>
                              <p className="text-xs text-gray-400">
                                {feature.categoria} · {feature.horasEstimadas}h
                              </p>
                            </div>
                          </div>
                          {selectedFeatureIds.includes(feature.id) && (
                            <Check className="w-4 h-4 text-brand" />
                          )}
                        </div>
                      ))}
                  </div>
                  <DialogFooter className="mt-6">
                    <Button
                      variant="ghost"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="bg-brand text-white hover:bg-brand-dark"
                      onClick={handleAddFeatures}
                    >
                      Adicionar selecionadas ({selectedFeatureIds.length})
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {(quote.itens || []).length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-400">
                    Nenhuma funcionalidade adicionada ainda.
                  </p>
                </div>
              ) : (
                (quote.itens || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.nome}
                      </p>
                      <p className="text-xs font-mono text-gray-500">
                        {item.horas}h estimadas
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-gray-300 hover:text-danger hover:bg-danger-bg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 rounded-[14px]">
            <div className="section-label mb-6">Condições & Negociação</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase">
                    Desconto (%)
                  </label>
                  <Input
                    type="number"
                    value={quote.desconto}
                    onChange={(e) =>
                      setQuote({ ...quote, desconto: Number(e.target.value) })
                    }
                    className="h-11 rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase">
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
                    className="h-11 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase">
                    Entrada (R$)
                  </label>
                  <Input
                    type="number"
                    value={quote.entrada}
                    onChange={(e) =>
                      setQuote({ ...quote, entrada: Number(e.target.value) })
                    }
                    className="h-11 rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase">
                    Nº Parcelas
                  </label>
                  <Input
                    type="number"
                    value={quote.parcelas}
                    onChange={(e) =>
                      setQuote({ ...quote, parcelas: Number(e.target.value) })
                    }
                    className="h-11 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase">
                Notas internas
              </label>
              <Textarea
                value={quote.notasInternas}
                onChange={(e) =>
                  setQuote({ ...quote, notasInternas: e.target.value })
                }
                placeholder="Ex: Cliente solicitou entrega rápida..."
                className="min-h-[100px] rounded-lg"
              />
            </div>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button
              variant="outline"
              className="rounded-lg h-11 px-8"
              onClick={() => router.push('/orcamentos')}
            >
              Cancelar
            </Button>
            <Button
              className="bg-brand text-white hover:bg-brand-dark rounded-lg h-11 px-8"
              onClick={handleSave}
            >
              Salvar orçamento
            </Button>
          </div>
        </div>

        {/* Right Panel: Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-6">
            <Card className="bg-brand-deep text-white border-none rounded-[14px] overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-sm font-semibold text-brand-mid uppercase tracking-wider mb-6">
                  Resumo do orçamento
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-brand-light/60">
                      Total de horas
                    </span>
                    <span className="font-mono font-medium">
                      {totals.totalHoras}h
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-brand-light/60">
                      Valor bruto
                    </span>
                    <span className="font-mono font-medium">
                      {totals.valorBruto.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                  {totals.valorDesconto > 0 && (
                    <div className="flex justify-between items-center text-red-300">
                      <span className="text-sm">
                        Desconto ({quote.desconto}%)
                      </span>
                      <span className="font-mono font-medium">
                        -{' '}
                        {totals.valorDesconto.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>
                  )}
                  {totals.valorUrgencia > 0 && (
                    <div className="flex justify-between items-center text-amber-300">
                      <span className="text-sm">
                        Urgência ({quote.acrescimoUrgencia}%)
                      </span>
                      <span className="font-mono font-medium">
                        +{' '}
                        {totals.valorUrgencia.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-brand-dark/30">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-sm text-brand-mid uppercase font-bold">
                    Total
                  </span>
                  <span className="text-3xl font-mono font-bold leading-none">
                    {totals.totalValor.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 text-brand-mid mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase font-bold">
                        Prazo
                      </span>
                    </div>
                    <p className="text-sm font-mono font-medium">
                      {totals.prazoSemanas} semanas
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 text-brand-mid mb-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase font-bold">
                        Módulos
                      </span>
                    </div>
                    <p className="text-sm font-mono font-medium">
                      {totals.modulos}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="section-label text-brand-mid/50 border-brand-mid/10">
                    Pagamento
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-brand-light/60">Entrada</span>
                    <span className="font-mono font-medium">
                      {quote.entrada?.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-brand-light/60">
                      {quote.parcelas}× Parcelas
                    </span>
                    <span className="font-mono font-medium">
                      {totals.valorParcela.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-brand text-center">
                <p className="text-[10px] text-brand-light/70 uppercase font-medium">
                  Validade da proposta
                </p>
                <p className="text-xs font-mono">
                  {new Date(quote.validoAte || '').toLocaleDateString('pt-BR')}
                </p>
              </div>
            </Card>

            <div className="mt-6 flex flex-col gap-3">
              <Button className="w-full bg-white text-brand hover:bg-brand-light h-12 rounded-xl font-semibold gap-2">
                <Calculator className="w-4 h-4" />
                Simular cenários
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-200 text-gray-500 hover:text-gray-900 h-12 rounded-xl"
                onClick={() => router.push(`/orcamentos/${id}/proposta`)}
                disabled={isNew}
              >
                Visualizar proposta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
