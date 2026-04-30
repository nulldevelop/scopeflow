'use client'

import { toast } from 'sonner'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '../_actions/create-client'
import { updateClient } from '../_actions/update-client'
import { type CreateClientInput, createClientSchema } from '../_schemas/client'

interface ClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (client: { id: string; name: string }) => void
  initialData?: {
    id: string
    name: string
    email?: string | null
    document?: string | null
    phone?: string | null
  }
}

export function ClientModal({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: ClientModalProps) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      document: initialData?.document || '',
      phone: initialData?.phone || '',
    },
  })

  // Reseta form quando abre/fecha
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset()
    }
    onOpenChange(isOpen)
  }

  const onSubmit = async (data: CreateClientInput) => {
    setLoading(true)
    try {
      if (isEditing && initialData) {
        const res = await updateClient({ ...data, id: initialData.id })
        if (!res.success) {
          toast.error(res.error)
          return
        }
        toast.success('Cliente atualizado com sucesso!')
        onSuccess?.(res.data)
        handleOpenChange(false)
      } else {
        const res = await createClient(data)
        if (!res.success) {
          toast.error(res.error)
          return
        }
        toast.success('Cliente criado com sucesso!')
        onSuccess?.(res.data)
        handleOpenChange(false)
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar cliente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nome do cliente"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">Documento (CPF/CNPJ)</Label>
            <Input
              id="document"
              {...register('document')}
              placeholder="000.000.000-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="(00) 00000-0000"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand text-white hover:bg-brand-dark"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
