'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  let formatted = ''
  for (let i = 0; i < digits.length; i++) {
    if (i === 3 || i === 6) formatted += '.'
    if (i === 9) formatted += '-'
    formatted += digits[i]
  }
  return formatted
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  let formatted = ''
  for (let i = 0; i < digits.length; i++) {
    if (i === 0) formatted += '('
    if (i === 2) formatted += ') '
    if (i === 7 && digits.length > 10) formatted += '-'
    if (i === 6 && digits.length <= 10) formatted += '-'
    formatted += digits[i]
  }
  return formatted
}

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
    address?: string | null
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
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      document: initialData?.document || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
    },
  })

  // Sincroniza dados iniciais quando mudam (ex: clicar em Editar em diferentes clientes)
  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name || '',
        email: initialData?.email || '',
        document: initialData?.document || '',
        phone: initialData?.phone || '',
        address: initialData?.address || '',
      })
    }
  }, [initialData, reset, open])

  const handleDocumentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCPF(e.target.value)
      setValue('document', formatted, { shouldValidate: true })
    },
    [setValue],
  )

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value)
      setValue('phone', formatted, { shouldValidate: true })
    },
    [setValue],
  )

  // Reseta form quando abre/fecha
  const handleOpenChange = (isOpen: boolean) => {
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
              <p className="text-sm text-danger">{errors.name.message}</p>
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
              <p className="text-sm text-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">CPF</Label>
            <Input
              id="document"
              {...register('document')}
              onChange={handleDocumentChange}
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
            {errors.document && (
              <p className="text-sm text-danger">{errors.document.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              {...register('phone')}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              inputMode="numeric"
            />
            {errors.phone && (
              <p className="text-sm text-danger">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Rua, nº, bairro, cidade/UF, CEP"
            />
            {errors.address && (
              <p className="text-sm text-danger">{errors.address.message}</p>
            )}
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
