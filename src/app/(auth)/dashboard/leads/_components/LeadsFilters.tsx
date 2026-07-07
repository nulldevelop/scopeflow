'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCategoryLabel } from '@/lib/leads/category-labels'
import { STAGE_LABELS, STAGE_ORDER } from '@/lib/leads/lead-stage'

export type LeadsFilterState = {
  category: string
  minScore: string
  hasWebsite: string
  stage: string
}

type Props = {
  categories: string[]
  filters: LeadsFilterState
  onChange: (patch: Partial<LeadsFilterState>) => void
}

export function LeadsFilters({ categories, filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>Categoria</Label>
        <Select value={filters.category} onValueChange={(v) => onChange({ category: v })}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {getCategoryLabel(category)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="minScore">Score mínimo</Label>
        <Input
          id="minScore"
          type="number"
          min={0}
          max={100}
          value={filters.minScore}
          onChange={(e) => onChange({ minScore: e.target.value })}
          className="w-28"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Site</Label>
        <Select value={filters.hasWebsite} onValueChange={(v) => onChange({ hasWebsite: v })}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Com site</SelectItem>
            <SelectItem value="false">Sem site</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Estágio</Label>
        <Select value={filters.stage} onValueChange={(v) => onChange({ stage: v })}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {STAGE_ORDER.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {STAGE_LABELS[stage]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
