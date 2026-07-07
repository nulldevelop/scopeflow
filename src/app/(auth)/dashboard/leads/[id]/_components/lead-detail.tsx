'use client'

import { ArrowLeft, Globe, MessageCircle, Pencil, Send, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getCategoryLabel } from '@/lib/leads/category-labels'
import { STAGE_LABELS, STAGE_ORDER, STAGE_TEXT_CLASS } from '@/lib/leads/lead-stage'
import { buildWhatsAppUrl, OUTREACH_OFFER_LABELS, type OutreachOfferType } from '@/lib/leads/whatsapp'
import type { LeadStage } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { addLeadActivityAction } from '../../_actions/add-lead-activity'
import { deleteLeadAction } from '../../_actions/delete-lead'
import { deleteLeadActivityAction } from '../../_actions/delete-lead-activity'
import { updateLeadAction } from '../../_actions/update-lead'
import { DomainDiagnostics } from '../../_components/DomainDiagnostics'
import type { LeadDetailData } from '../../_data-access/get-leads'

type Props = { lead: LeadDetailData }

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR')
}

export function LeadDetail({ lead: initialLead }: Props) {
  const router = useRouter()
  const [lead, setLead] = useState(initialLead)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()

  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState(lead.name)
  const [phone, setPhone] = useState(lead.phone ?? '')
  const [address, setAddress] = useState(lead.address)
  const [category, setCategory] = useState(lead.category)
  const [website, setWebsite] = useState(lead.website ?? '')

  const [notes, setNotes] = useState(lead.notes ?? '')
  const [activityContent, setActivityContent] = useState('')
  const [isAddingActivity, startAddActivityTransition] = useTransition()

  const [offerType, setOfferType] = useState<OutreachOfferType>('diagnostico')
  const whatsAppUrl = lead.phone ? buildWhatsAppUrl(lead.phone, lead, offerType) : null

  function handleStageChange(next: LeadStage) {
    setLead((prev) => ({ ...prev, stage: next }))
    startTransition(async () => {
      const res = await updateLeadAction(lead.id, { stage: next })
      if (!res.success) toast.error(res.error)
    })
  }

  function handleSaveNotes() {
    startTransition(async () => {
      const res = await updateLeadAction(lead.id, { notes })
      if (res.success) {
        toast.success('Notas salvas.')
      } else {
        toast.error(res.error)
      }
    })
  }

  function handleSaveEdit() {
    startTransition(async () => {
      const res = await updateLeadAction(lead.id, { name, phone, address, category, website })
      if (res.success) {
        setLead((prev) => ({
          ...prev,
          name,
          phone: phone || null,
          address,
          category,
          website: website || null,
          hasWebsite: website !== '',
        }))
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
      if (res.success) {
        toast.success('Lead excluído.')
        router.push('/dashboard/leads')
      } else {
        toast.error(res.error)
      }
    })
  }

  function handleAddActivity() {
    if (!activityContent.trim()) return

    startAddActivityTransition(async () => {
      const res = await addLeadActivityAction(lead.id, { content: activityContent.trim() })
      if (res.success) {
        setLead((prev) => ({ ...prev, activities: [res.data, ...prev.activities] }))
        setActivityContent('')
      } else {
        toast.error(res.error)
      }
    })
  }

  function handleDeleteActivity(activityId: string) {
    if (!confirm('Remover este registro do histórico?')) return

    startTransition(async () => {
      const res = await deleteLeadActivityAction(lead.id, activityId)
      if (res.success) {
        setLead((prev) => ({
          ...prev,
          activities: prev.activities.filter((activity) => activity.id !== activityId),
        }))
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] pb-16">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 px-8 py-3 backdrop-blur-xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/leads')}
          className="gap-2 text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="gap-2 border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <Pencil className="w-4 h-4" /> Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2 border-danger/30 text-danger hover:bg-danger-bg"
          >
            <Trash2 className="w-4 h-4" /> Excluir
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-8 pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{lead.name}</h1>
            <p className="text-sm text-gray-400">
              {getCategoryLabel(lead.category)} · {lead.address || '—'}
            </p>
          </div>
          <Select value={lead.stage} onValueChange={(v) => handleStageChange(v as LeadStage)} disabled={isPending}>
            <SelectTrigger className="w-44">
              <SelectValue>
                <span className={cn('font-medium', STAGE_TEXT_CLASS[lead.stage])}>
                  {STAGE_LABELS[lead.stage]}
                </span>
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
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <Card className="space-y-3 rounded-[24px] border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-900">Contato</h2>
              <div className="space-y-1.5 text-sm text-gray-600">
                <p>
                  <span className="text-gray-400">Telefone: </span>
                  {lead.phone ?? '—'}
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="text-gray-400">Site: </span>
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-brand hover:underline"
                    >
                      <Globe className="size-3.5" /> {lead.website}
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              {lead.phone && (
                <div className="space-y-3">
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
                  {whatsAppUrl && (
                    <Button asChild className="w-full bg-ok hover:bg-ok/90">
                      <a href={whatsAppUrl} target="_blank" rel="noreferrer">
                        <MessageCircle /> Chamar no WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </Card>

            <Card className="space-y-3 rounded-[24px] border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-900">Notas</h2>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Anotações gerais sobre o lead..."
              />
              <Button size="sm" onClick={handleSaveNotes} disabled={isPending}>
                Salvar notas
              </Button>
            </Card>
          </div>

          <Card className="rounded-[24px] border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Diagnóstico do site</h2>
            <DomainDiagnostics lead={lead} />
          </Card>
        </div>

        <Card className="space-y-4 rounded-[24px] border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-900">Histórico de conversas</h2>
          <div className="flex gap-2">
            <Textarea
              value={activityContent}
              onChange={(e) => setActivityContent(e.target.value)}
              placeholder="Registrar ligação, WhatsApp, reunião..."
              rows={2}
              className="flex-1"
            />
            <Button
              onClick={handleAddActivity}
              disabled={isAddingActivity || !activityContent.trim()}
              className="self-end"
            >
              <Send className="w-4 h-4" /> Registrar
            </Button>
          </div>

          {lead.activities.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">Nenhum registro ainda.</p>
          ) : (
            <ul className="space-y-3 border-t border-gray-100 pt-4">
              {lead.activities.map((activity) => (
                <li key={activity.id} className="group flex items-start justify-between gap-4">
                  <div>
                    <p className="whitespace-pre-line text-sm text-gray-900">{activity.content}</p>
                    <p className="mt-1 text-xs text-gray-400">{formatDateTime(activity.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="text-gray-300 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                    aria-label="Remover registro"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
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
    </div>
  )
}
