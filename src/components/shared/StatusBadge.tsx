import { cn } from '@/lib/utils'
import { ProjectStatus } from '@/types'

interface StatusBadgeProps {
  status: ProjectStatus
  className?: string
}

const statusConfig = {
  rascunho: {
    label: 'Rascunho',
    className: 'bg-gray-100 text-gray-600',
  },
  enviada: {
    label: 'Enviada',
    className: 'bg-accent-blue-bg text-accent-blue',
  },
  aprovada: {
    label: 'Aprovada',
    className: 'bg-ok-bg text-ok',
  },
  recusada: {
    label: 'Recusada',
    className: 'bg-danger-bg text-danger',
  },
  expirada: {
    label: 'Expirada',
    className: 'bg-gray-100 text-gray-500',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
