'use client'

import { ChevronsUpDownIcon, PlusIcon, XIcon } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CATEGORY_LABELS, getCategoryLabel } from '@/lib/leads/category-labels'
import { triggerCollectionAction } from '../_actions/collect-leads'

const CATEGORY_TAG_REGEX = /^[a-z][a-z0-9_]*$/
const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).sort(([, a], [, b]) => a.localeCompare(b, 'pt-BR'))

export function TriggerCollectionDialog() {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [categorySearch, setCategorySearch] = useState('')
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false)
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [radiusMeters, setRadiusMeters] = useState('1500')
  const [result, setResult] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggleCategory(tag: string) {
    setCategories((prev) => (prev.includes(tag) ? prev.filter((c) => c !== tag) : [...prev, tag]))
  }

  function addCustomCategory(tag: string) {
    if (!CATEGORY_TAG_REGEX.test(tag) || categories.includes(tag)) return
    setCategories((prev) => [...prev, tag])
    setCategorySearch('')
  }

  function handleSubmit() {
    setResult(null)
    startTransition(async () => {
      const response = await triggerCollectionAction({
        categories,
        lat: Number(lat),
        lng: Number(lng),
        radiusMeters: Number(radiusMeters),
      })

      if (response.success) {
        setResult(
          `Encontrados: ${response.data.found} · Falhas na verificação de domínio: ${response.data.domainChecksFailed}`,
        )
      } else {
        setResult(`Erro: ${response.error}`)
      }
    })
  }

  const canAddCustom = categorySearch.trim().length > 0 && CATEGORY_TAG_REGEX.test(categorySearch.trim())

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-gray-900 hover:bg-gray-50 rounded-xl flex items-center gap-2 h-11 px-5 font-medium transition-all shadow-lg shadow-brand/10">
          Nova coleta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Disparar nova coleta</DialogTitle>
          <DialogDescription>
            Busca estabelecimentos no OpenStreetMap dentro do raio informado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Categorias</Label>
            <Popover open={categoryPickerOpen} onOpenChange={setCategoryPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between bg-white font-normal"
                >
                  <span className="text-gray-500">
                    {categories.length === 0
                      ? 'Selecione uma ou mais categorias'
                      : `${categories.length} categoria${categories.length === 1 ? '' : 's'} selecionada${categories.length === 1 ? '' : 's'}`}
                  </span>
                  <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput
                    value={categorySearch}
                    onValueChange={setCategorySearch}
                    placeholder="Buscar ou digitar tag OSM..."
                  />
                  <CommandList>
                    <CommandEmpty>
                      {canAddCustom ? (
                        <button
                          type="button"
                          onClick={() => addCustomCategory(categorySearch.trim())}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <PlusIcon className="size-4 text-muted-foreground" />
                          Adicionar tag "{categorySearch.trim()}"
                        </button>
                      ) : (
                        'Nenhuma categoria encontrada.'
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {CATEGORY_OPTIONS.map(([tag, label]) => (
                        <CommandItem
                          key={tag}
                          value={label}
                          data-checked={categories.includes(tag)}
                          onSelect={() => toggleCategory(tag)}
                        >
                          {label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {categories.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {getCategoryLabel(tag)}
                    <button
                      type="button"
                      onClick={() => toggleCategory(tag)}
                      aria-label={`Remover ${getCategoryLabel(tag)}`}
                      className="rounded-full p-0.5 hover:bg-gray-200"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="-23.5505"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="-46.6333"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="radius">Raio (metros)</Label>
            <Input
              id="radius"
              type="number"
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(e.target.value)}
            />
          </div>
        </div>

        {result && <p className="text-sm text-gray-500">{result}</p>}

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending || categories.length === 0}>
            {isPending ? 'Coletando...' : 'Iniciar coleta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
