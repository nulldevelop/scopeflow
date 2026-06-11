'use client'

import { AlertTriangle, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signOut } from '@/lib/auth-client'
import { deleteAccountAction } from '../_actions/delete-account'

const CONFIRM_WORD = 'EXCLUIR'

export function DangerZone() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState('')
  const [isDeleting, setIsDeleting] = React.useState(false)

  const canDelete = confirmText.trim().toUpperCase() === CONFIRM_WORD

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return
    setIsDeleting(true)
    try {
      const result = await deleteAccountAction()
      if (!result.success) {
        toast.error(result.error || 'Erro ao excluir a conta.')
        setIsDeleting(false)
        return
      }

      toast.success('Conta excluída. Sentiremos sua falta!')
      // Limpa a sessão no cliente e redireciona para fora do app.
      await signOut({
        fetchOptions: {
          onResponse: () => {
            router.push('/')
            router.refresh()
          },
        },
      })
    } catch (_error) {
      toast.error('Erro de conexão ao excluir a conta.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Segurança</h3>
        <p className="text-sm text-gray-500">
          Gerencie ações sensíveis relacionadas à sua conta.
        </p>
      </div>

      <div className="rounded-2xl border border-danger/30 bg-danger-bg/40 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-danger-bg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-danger" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-danger">Zona de Perigo</h4>
            <p className="text-sm text-danger/80 mt-1 max-w-xl">
              Excluir sua conta é <strong>permanente e irreversível</strong>.
              Todos os seus dados organização, clientes, orçamentos, contratos e
              catálogo serão apagados definitivamente.
            </p>

            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setConfirmText('')
                setOpen(true)
              }}
              className="mt-4 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Excluir minha conta
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => !isDeleting && setOpen(v)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-danger-bg flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-danger" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Excluir conta permanentemente?
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Sua organização e todos os dados
              vinculados serão apagados para sempre.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-sm text-gray-700">
              Digite{' '}
              <span className="font-mono font-bold text-danger">
                {CONFIRM_WORD}
              </span>{' '}
              para confirmar
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              autoComplete="off"
              disabled={isDeleting}
              className="rounded-lg h-11"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete || isDeleting}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Excluindo...' : 'Excluir definitivamente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
