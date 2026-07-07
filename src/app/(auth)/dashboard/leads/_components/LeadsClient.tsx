'use client'

import { Globe, MessageCircle, Target } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Header } from '@/components/shared/Header'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getCategoryLabel } from '@/lib/leads/category-labels'
import { getDomainBadge } from '@/lib/leads/domain-badge'
import { STAGE_LABELS, STAGE_ORDER, STAGE_TEXT_CLASS } from '@/lib/leads/lead-stage'
import { buildWhatsAppUrl } from '@/lib/leads/whatsapp'
import type { LeadStage } from '@/lib/prisma'
import type { LeadData } from '../_data-access/get-leads'
import { LeadDetailsDialog } from './LeadDetailsDialog'
import { LeadRowActions } from './LeadRowActions'
import { LeadsFilters, type LeadsFilterState } from './LeadsFilters'
import { TriggerCollectionDialog } from './TriggerCollectionDialog'

const DEFAULT_FILTERS: LeadsFilterState = {
  category: 'all',
  minScore: '',
  hasWebsite: 'all',
  stage: 'all',
}

export function LeadsClient({ initialLeads }: { initialLeads: LeadData[] }) {
  const [filters, setFilters] = useState<LeadsFilterState>(DEFAULT_FILTERS)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const categories = useMemo(
    () => Array.from(new Set(initialLeads.map((lead) => lead.category))).sort((a, b) => a.localeCompare(b)),
    [initialLeads],
  )

  const preStageFiltered = useMemo(() => {
    return initialLeads.filter((lead) => {
      if (filters.category !== 'all' && lead.category !== filters.category) return false
      if (filters.minScore !== '' && lead.score < Number(filters.minScore)) return false
      if (filters.hasWebsite === 'true' && !lead.hasWebsite) return false
      if (filters.hasWebsite === 'false' && lead.hasWebsite) return false
      return true
    })
  }, [initialLeads, filters.category, filters.minScore, filters.hasWebsite])

  const filteredLeads = useMemo(() => {
    const byStage =
      filters.stage === 'all'
        ? preStageFiltered
        : preStageFiltered.filter((lead) => lead.stage === filters.stage)

    return [...byStage].sort((a, b) => (sortDir === 'desc' ? b.score - a.score : a.score - b.score))
  }, [preStageFiltered, filters.stage, sortDir])

  const statusCounts = useMemo(() => {
    const counts = new Map<string, { count: number; dotClassName: string }>()
    for (const lead of filteredLeads) {
      const badge = getDomainBadge(lead)
      const existing = counts.get(badge.label)
      counts.set(badge.label, {
        count: (existing?.count ?? 0) + 1,
        dotClassName: badge.dotClassName,
      })
    }
    return counts
  }, [filteredLeads])

  const stageCounts = useMemo(() => {
    const counts = new Map<LeadStage, number>()
    for (const lead of preStageFiltered) {
      counts.set(lead.stage, (counts.get(lead.stage) ?? 0) + 1)
    }
    return counts
  }, [preStageFiltered])

  const hasActiveFilters =
    filters.category !== 'all' || filters.minScore !== '' || filters.hasWebsite !== 'all' || filters.stage !== 'all'

  return (
    <div className="min-h-screen bg-[#F8F7F3]">
      <Header
        title="Leads"
        subtitle="Diagnóstico de presença digital · fila priorizada de vendas"
        icon={Target}
      >
        <TriggerCollectionDialog />
      </Header>

      <div className="px-8 -mt-14 relative z-10 pb-12">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <Card className="p-6 bg-white border border-gray-200 rounded-[24px] space-y-4">
            <LeadsFilters
              categories={categories}
              filters={filters}
              onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
            />
            <Separator />
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="font-mono font-semibold text-gray-900">
                {filteredLeads.length} lead{filteredLeads.length === 1 ? '' : 's'}
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-gray-500">
                {[...statusCounts.entries()].map(([label, { count, dotClassName }]) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className={`size-1.5 rounded-full ${dotClassName}`} />
                    <span className="font-mono">{count}</span> {label}
                  </span>
                ))}
              </div>
              <div className="ml-auto flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, minScore: '60' }))}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-900 transition-colors hover:bg-gray-50"
                >
                  Só os melhores (score ≥ 60)
                </button>
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, hasWebsite: 'false' }))}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-900 transition-colors hover:bg-gray-50"
                >
                  Só sem site
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-50"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-gray-100 pt-3 text-sm">
              {STAGE_ORDER.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, stage: prev.stage === stage ? 'all' : stage }))}
                  className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors hover:bg-gray-50 ${STAGE_TEXT_CLASS[stage]}`}
                >
                  <span className="font-mono font-semibold">{stageCounts.get(stage) ?? 0}</span>
                  {STAGE_LABELS[stage]}
                </button>
              ))}
            </div>
          </Card>

          <Card className="border border-gray-200 rounded-[24px] overflow-hidden shadow-sm bg-white">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-b border-gray-100">
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 pl-6">
                    Empresa
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Local
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Contato
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    <button
                      type="button"
                      onClick={() => setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                      className="flex items-center gap-1 hover:text-gray-600"
                    >
                      Diagnóstico {sortDir === 'desc' ? '↓' : '↑'}
                    </button>
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 pr-6">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => {
                  const whatsAppUrl = lead.phone
                    ? buildWhatsAppUrl(lead.phone, {
                        name: lead.name,
                        hasWebsite: lead.hasWebsite,
                        domainStatus: lead.domainStatus,
                      })
                    : null

                  return (
                    <TableRow key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{lead.name}</span>
                          <span className="text-xs text-gray-400">{getCategoryLabel(lead.category)}</span>
                        </div>
                      </TableCell>
                      <TableCell
                        className="max-w-48 truncate text-gray-500"
                        title={lead.address ?? undefined}
                      >
                        {lead.address || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-900">{lead.phone ?? '—'}</span>
                          {lead.website && (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noreferrer"
                              title={lead.website}
                              aria-label="Abrir site em nova aba"
                              className="text-gray-400 transition-colors hover:text-brand"
                            >
                              <Globe className="size-3.5" />
                            </a>
                          )}
                          {whatsAppUrl && (
                            <a
                              href={whatsAppUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Chamar no WhatsApp"
                              aria-label="Chamar no WhatsApp"
                              className="text-gray-400 transition-colors hover:text-ok"
                            >
                              <MessageCircle className="size-3.5" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <LeadDetailsDialog
                          lead={{
                            name: lead.name,
                            phone: lead.phone,
                            hasWebsite: lead.hasWebsite,
                            website: lead.website,
                            domainStatus: lead.domainStatus,
                            score: lead.score,
                          }}
                        />
                      </TableCell>
                      <TableCell className="pr-6">
                        <LeadRowActions
                          lead={{
                            id: lead.id,
                            stage: lead.stage,
                            notes: lead.notes,
                            name: lead.name,
                            phone: lead.phone,
                            address: lead.address,
                            category: lead.category,
                            website: lead.website,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredLeads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-24 text-center text-gray-400">
                      Nenhum lead encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  )
}
