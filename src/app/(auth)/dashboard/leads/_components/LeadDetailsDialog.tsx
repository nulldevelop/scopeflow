'use client'

import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getDomainBadge } from '@/lib/leads/domain-badge'
import type { DomainStatus, HttpCheckStatus } from '@/lib/leads/domain-check'
import { explainScore } from '@/lib/leads/scoring'
import { buildWhatsAppUrl } from '@/lib/leads/whatsapp'
import { cn } from '@/lib/utils'
import { ScoreMeter } from './ScoreMeter'

type Props = {
  lead: {
    name: string
    phone: string | null
    hasWebsite: boolean
    website: string | null
    domainStatus: unknown
    score: number
  }
}

const HTTP_LABELS: Record<HttpCheckStatus, string> = {
  online: 'Online',
  client_error: 'Erro do cliente (4xx)',
  server_error: 'Erro do servidor (5xx)',
  timeout: 'Timeout',
  unreachable: 'Inacessível',
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function LeadDetailsDialog({ lead }: Props) {
  const [open, setOpen] = useState(false)
  const badge = getDomainBadge(lead)
  const status = lead.domainStatus as DomainStatus | null
  const reasons = explainScore({
    hasWebsite: lead.hasWebsite,
    domainStatus: status,
  })
  const whatsAppUrl = lead.phone ? buildWhatsAppUrl(lead.phone, lead) : null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2.5 rounded-md py-1 pr-2 text-left transition-colors hover:bg-gray-50"
      >
        <ScoreMeter score={lead.score} />
        <span className="flex flex-col leading-tight">
          <span className="font-mono text-sm font-semibold text-gray-900">{lead.score}</span>
          <span className={cn('text-xs', badge.textClassName)}>{badge.label}</span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Diagnóstico do site</DialogTitle>
            <DialogDescription>
              {lead.website ?? 'Nenhum site encontrado para este estabelecimento.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
            <ScoreMeter score={lead.score} size="lg" />
            <span className="font-mono text-2xl font-semibold text-gray-900">{lead.score}</span>
            <span className="text-sm text-gray-400">/ 100</span>
            <span className={cn('ml-auto text-sm font-medium', badge.textClassName)}>
              {badge.label}
            </span>
          </div>

          {status && (
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <span className="text-gray-400">HTTP</span>
              <span className="text-gray-900">
                {HTTP_LABELS[status.http.status]}
                {status.http.statusCode ? ` (${status.http.statusCode})` : ''}
              </span>

              <span className="text-gray-400">SSL</span>
              <span className="text-gray-900">
                {status.ssl
                  ? status.ssl.valid
                    ? `Válido até ${formatDate(status.ssl.validTo)} (${status.ssl.daysRemaining} dias)`
                    : `Inválido${status.ssl.error ? ` — ${status.ssl.error}` : ''}`
                  : 'Não verificado (site sem HTTPS)'}
              </span>

              <span className="text-gray-400">Domínio expira</span>
              <span className="text-gray-900">
                {status.domain.expiresAt
                  ? `${formatDate(status.domain.expiresAt)} (${status.domain.daysRemaining} dias)`
                  : (status.domain.error ?? 'Sem dados')}
              </span>

              <span className="text-gray-400">Domínio registrado desde</span>
              <span className="text-gray-900">
                {status.domain.registeredAt
                  ? `${formatDate(status.domain.registeredAt)} (${Math.floor((status.domain.ageDays ?? 0) / 365)} anos)`
                  : 'Sem dados'}
              </span>

              <span className="text-gray-400">Mobile-friendly</span>
              <span className="text-gray-900">
                {status.freshness.hasMobileViewport === null
                  ? 'Não verificado'
                  : status.freshness.hasMobileViewport
                    ? 'Sim'
                    : 'Não (sem meta viewport)'}
              </span>

              <span className="text-gray-400">Copyright no rodapé</span>
              <span className="text-gray-900">{status.freshness.copyrightYear ?? 'Não encontrado'}</span>

              <span className="text-gray-400">1ª aparição (Wayback)</span>
              <span className="text-gray-900">
                {status.wayback.firstSnapshot ? formatDate(status.wayback.firstSnapshot) : 'Sem dados'}
              </span>

              <span className="text-gray-400">Última mudança (Wayback)</span>
              <span className="text-gray-900">
                {status.wayback.lastSnapshot ? formatDate(status.wayback.lastSnapshot) : 'Sem dados'}
              </span>

              <span className="text-gray-400">Verificado em</span>
              <span className="text-gray-900">{new Date(status.checkedAt).toLocaleString('pt-BR')}</span>
            </div>
          )}

          <div className="space-y-1.5 border-t border-gray-100 pt-3 text-sm">
            <p className="font-medium text-gray-900">Por que o score é {lead.score}?</p>
            <ul className="space-y-1">
              {reasons.map((reason) => (
                <li key={reason.label} className="flex justify-between gap-4 text-gray-400">
                  <span>{reason.label}</span>
                  <span className="font-medium text-gray-900">+{reason.points}</span>
                </li>
              ))}
            </ul>
          </div>

          {whatsAppUrl && (
            <DialogFooter>
              <Button asChild className="bg-ok hover:bg-ok/90">
                <a href={whatsAppUrl} target="_blank" rel="noreferrer">
                  <MessageCircle />
                  Chamar no WhatsApp
                </a>
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
