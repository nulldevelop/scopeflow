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
import { buildWhatsAppUrl } from '@/lib/leads/whatsapp'
import { cn } from '@/lib/utils'
import { DomainDiagnostics } from './DomainDiagnostics'
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

export function LeadDetailsDialog({ lead }: Props) {
  const [open, setOpen] = useState(false)
  const badge = getDomainBadge(lead)
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

          <DomainDiagnostics lead={lead} />

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
