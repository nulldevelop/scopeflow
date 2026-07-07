'use client'

import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { bulkRecheckLeadsAction } from '../_actions/recheck-domain'

export function BulkRecheckButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const res = await bulkRecheckLeadsAction()
      if (res.success) {
        const { checked, failed } = res.data
        if (checked === 0) {
          toast.info('Nenhum lead com site cadastrado pra reexaminar.')
        } else {
          toast.success(`${checked - failed}/${checked} sites reexaminados com sucesso.`)
        }
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-xl flex items-center gap-2 h-11 px-5 font-medium border-gray-200 bg-white/80 text-gray-700 hover:bg-white"
    >
      <RefreshCw className={cn('w-4 h-4', isPending && 'animate-spin')} />
      {isPending ? 'Reexaminando...' : 'Reexaminar todos'}
    </Button>
  )
}
