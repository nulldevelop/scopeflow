'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORY_LABELS } from '@/lib/leads/category-labels'
import { triggerCollectionAction } from '../_actions/collect-leads'

const CUSTOM_CATEGORY = '__custom__'
const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).sort(([, a], [, b]) => a.localeCompare(b, 'pt-BR'))

export function TriggerCollectionDialog() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState(false)
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [radiusMeters, setRadiusMeters] = useState('1500')
  const [result, setResult] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setResult(null)
    startTransition(async () => {
      const response = await triggerCollectionAction({
        category,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-gray-900 hover:bg-gray-50 rounded-xl flex items-center gap-2 h-11 px-5 font-medium transition-all shadow-lg shadow-brand/10">
          Nova coleta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disparar nova coleta</DialogTitle>
          <DialogDescription>
            Busca estabelecimentos no OpenStreetMap dentro do raio informado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={customCategory ? CUSTOM_CATEGORY : category}
              onValueChange={(v) => {
                if (v === CUSTOM_CATEGORY) {
                  setCustomCategory(true)
                  setCategory('')
                } else {
                  setCustomCategory(false)
                  setCategory(v)
                }
              }}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map(([tag, label]) => (
                  <SelectItem key={tag} value={tag}>
                    {label}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_CATEGORY}>Outra (digitar tag OSM)</SelectItem>
              </SelectContent>
            </Select>
            {customCategory && (
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="ex: locksmith, tattoo, pet_shop"
                className="mt-1.5"
              />
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
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Coletando...' : 'Iniciar coleta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
