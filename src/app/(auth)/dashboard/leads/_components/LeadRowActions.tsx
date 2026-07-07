'use client'

import { NotebookPen, Pencil, Trash2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { STAGE_LABELS, STAGE_ORDER, STAGE_TEXT_CLASS } from '@/lib/leads/lead-stage'
import type { LeadStage } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { deleteLeadAction } from '../_actions/delete-lead'
import { updateLeadAction } from '../_actions/update-lead'

type Props = {
  lead: {
    id: string
    stage: LeadStage
    notes: string | null
    name: string
    phone: string | null
    address: string
    category: string
    website: string | null
  }
}

export function LeadRowActions({ lead }: Props) {
  const [stage, setStage] = useState(lead.stage)
  const [notes, setNotes] = useState(lead.notes ?? '')
  const [notesOpen, setNotesOpen] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState(lead.name)
  const [phone, setPhone] = useState(lead.phone ?? '')
  const [address, setAddress] = useState(lead.address)
  const [category, setCategory] = useState(lead.category)
  const [website, setWebsite] = useState(lead.website ?? '')

  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()

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
        setNotesOpen(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  function handleSaveEdit() {
    startTransition(async () => {
      const res = await updateLeadAction(lead.id, { name, phone, address, category, website })
      if (res.success) {
        setEditOpen(false)
        toast.success('Lead atualizado com sucesso!')
      } else {
        toast.error(res.error)
      }
    })
  }

  function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return

    startDeleteTransition(async () => {
      const res = await deleteLeadAction(lead.id)
      if (!res.success) toast.error(res.error)
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

      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Editar lead" title="Editar">
            <Pencil />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Nome</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-address">Endereço</Label>
              <Input id="edit-address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-category">Categoria</Label>
              <Input id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-website">Site</Label>
              <Input id="edit-website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEdit} disabled={isPending || !name.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Excluir lead"
        title="Excluir"
        className="text-gray-400 hover:text-danger"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 />
      </Button>
    </div>
  )
}
