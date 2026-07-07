'use client'

import { MessageCircle, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getDomainBadge } from '@/lib/leads/domain-badge'
import { buildWhatsAppUrl, OUTREACH_OFFER_LABELS, type OutreachOfferType } from '@/lib/leads/whatsapp'
import { cn } from '@/lib/utils'
import { recheckLeadDomainAction } from '../_actions/recheck-domain'
import { DomainDiagnostics } from './DomainDiagnostics'
import { ScoreMeter } from './ScoreMeter'

type Props = {
  lead: {
    id: string
    name: string
    phone: string | null
    hasWebsite: boolean
    website: string | null
    domainStatus: unknown
    score: number
  }
}

export function LeadDetailsDialog({ lead: initialLead }: Props) {
  const router = useRouter()
  const [lead, setLead] = useState(initialLead)
  const [open, setOpen] = useState(false)
  const [offerType, setOfferType] = useState<OutreachOfferType>('diagnostico')
  const [isRechecking, startRecheckTransition] = useTransition()
  const whatsAppUrl = lead.phone ? buildWhatsAppUrl(lead.phone, lead, offerType) : null

  function handleRecheckDomain() {
    startRecheckTransition(async () => {
      const res = await recheckLeadDomainAction(lead.id)
      if (res.success) {
        setLead((prev) => ({ ...prev, score: res.data.score, domainStatus: res.data.domainStatus }))
        toast.success('Site reexaminado, score atualizado.')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setLead(initialLead)
          setOpen(true)
        }}
        className="flex items-center gap-2.5 rounded-md py-1 pr-2 text-left transition-colors hover:bg-gray-50"
      >
        <ScoreMeter score={initialLead.score} />
        <span className="flex flex-col leading-tight">
          <span className="font-mono text-sm font-semibold text-gray-900">{initialLead.score}</span>
          <span className={cn('text-xs', getDomainBadge(initialLead).textClassName)}>
            {getDomainBadge(initialLead).label}
          </span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <DialogTitle>Diagnóstico do site</DialogTitle>
              {lead.website && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRecheckDomain}
                  disabled={isRechecking}
                  className="mr-6 gap-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <RefreshCw className={cn('size-3.5', isRechecking && 'animate-spin')} />
                  Reexaminar
                </Button>
              )}
            </div>
            <DialogDescription>
              {lead.website ?? 'Nenhum site encontrado para este estabelecimento.'}
            </DialogDescription>
          </DialogHeader>

          <DomainDiagnostics lead={lead} />

          {lead.phone && (
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-gray-500">Assunto da abordagem</span>
              <Select value={offerType} onValueChange={(v) => setOfferType(v as OutreachOfferType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OUTREACH_OFFER_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
