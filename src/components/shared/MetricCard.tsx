import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface MetricCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  variant?: 'brand' | 'ok' | 'blue' | 'default'
  className?: string
}

const variantStyles = {
  brand: 'text-brand',
  ok: 'text-ok',
  blue: 'text-accent-blue',
  default: 'text-gray-900',
}

const iconBgStyles = {
  brand: 'bg-brand-light',
  ok: 'bg-ok-bg',
  blue: 'bg-accent-blue-bg',
  default: 'bg-gray-50',
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        'p-6 bg-white border border-gray-200 rounded-[14px]',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'p-3 rounded-xl transition-colors',
            iconBgStyles[variant],
          )}
        >
          <Icon className={cn('w-5 h-5', variantStyles[variant])} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">
            {label}
          </p>
          <p
            className={cn(
              'text-2xl font-mono font-semibold leading-none',
              variantStyles[variant],
            )}
          >
            {value}
          </p>
        </div>
      </div>
    </Card>
  )
}
