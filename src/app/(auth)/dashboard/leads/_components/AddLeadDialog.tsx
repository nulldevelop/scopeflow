'use client'

import { Plus } from 'lucide-react'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createLeadAction } from '../_actions/create-lead'

const EMPTY_FORM = { name: '', phone: '', address: '', category: '', website: '' }

export function AddLeadDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const res = await createLeadAction(form)
      if (res.success) {
        toast.success('Lead adicionado com sucesso!')
        setForm(EMPTY_FORM)
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setForm(EMPTY_FORM)
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-white text-gray-900 hover:bg-gray-50 rounded-xl flex items-center gap-2 h-11 px-5 font-medium transition-all shadow-lg shadow-brand/10">
          <Plus className="w-4 h-4" />
          Novo lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar lead manualmente</DialogTitle>
          <DialogDescription>
            Útil pra leads que vieram de indicação ou contato direto, fora da coleta automática.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-lead-name">Nome</Label>
            <Input
              id="new-lead-name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do estabelecimento"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-lead-phone">Telefone</Label>
            <Input
              id="new-lead-phone"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 90000-0000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-lead-address">Endereço</Label>
            <Input
              id="new-lead-address"
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-lead-category">Categoria</Label>
            <Input
              id="new-lead-category"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="ex: restaurant, hairdresser"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-lead-website">Site</Label>
            <Input
              id="new-lead-website"
              value={form.website}
              onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending || !form.name.trim()}>
            {isPending ? 'Adicionando...' : 'Adicionar lead'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
