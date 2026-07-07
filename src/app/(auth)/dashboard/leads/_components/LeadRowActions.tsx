'use client'

import { NotebookPen } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { STAGE_LABELS, STAGE_ORDER, STAGE_TEXT_CLASS } from '@/lib/leads/lead-stage'
import type { LeadStage } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { updateLeadAction } from '../_actions/update-lead'

type Props = {
  lead: { id: string; stage: LeadStage; notes: string | null }
}

export function LeadRowActions({ lead }: Props) {
  const [stage, setStage] = useState(lead.stage)
  const [notes, setNotes] = useState(lead.notes ?? '')
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleStageChange(next: LeadStage) {
    setStage(next)
    startTransition(async () => {
      const res = await updateLeadAction(lead.id, { stage: next })
      if (!res.success) toast.error(res.error)
    })
  }

  function handleSaveNotes() {
    startTransition(async () => {
      const res = await updateLeadAction(lead.id, { notes })
      if (res.success) {
        setOpen(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={stage} onValueChange={(v) => handleStageChange(v as LeadStage)} disabled={isPending}>
        <SelectTrigger size="sm" className="w-40 border-none shadow-none">
          <SelectValue>
            <span className={cn('font-medium', STAGE_TEXT_CLASS[stage])}>{STAGE_LABELS[stage]}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STAGE_ORDER.map((option) => (
            <SelectItem key={option} value={option}>
              <span className={STAGE_TEXT_CLASS[option]}>{STAGE_LABELS[option]}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={lead.notes ? 'Ver e editar notas do lead' : 'Adicionar notas'}
            title="Notas"
          >
            <NotebookPen />
            {lead.notes && <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-brand" />}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notas do lead</DialogTitle>
          </DialogHeader>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} />
          <DialogFooter>
            <Button onClick={handleSaveNotes} disabled={isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
