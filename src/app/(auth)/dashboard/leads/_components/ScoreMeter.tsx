import { cn } from '@/lib/utils'

const SEGMENT_IDS = ['seg-1', 'seg-2', 'seg-3', 'seg-4', 'seg-5'] as const
const SEGMENTS = SEGMENT_IDS.length

function tier(score: number): { color: string; label: string } {
  if (score >= 60) return { color: 'bg-danger', label: 'crítico' }
  if (score >= 30) return { color: 'bg-accent-amber', label: 'atenção' }
  return { color: 'bg-ok', label: 'saudável' }
}

/**
 * Signature readout for lead scoring: a segmented signal meter, styled after the
 * diagnostic checks (HTTP, SSL, domain) that produce the score, not a generic progress bar.
 * More segments lit = a stronger signal that this business's web presence has failed.
 */
export function ScoreMeter({
  score,
  size = 'sm',
  className,
}: {
  score: number
  size?: 'sm' | 'lg'
  className?: string
}) {
  const filled = Math.max(1, Math.ceil((score / 100) * SEGMENTS))
  const { color, label } = tier(score)
  const barWidth = size === 'lg' ? 'w-1.5' : 'w-1'
  const barGap = size === 'lg' ? 'gap-1' : 'gap-0.5'

  return (
    <div
      className={cn('flex items-end', barGap, className)}
      role="img"
      aria-label={`Score ${score} de 100 — sinal ${label}`}
    >
      {SEGMENT_IDS.map((id, i) => {
        const active = i < filled
        const height = size === 'lg' ? 8 + i * 4 : 5 + i * 2.5
        return (
          <span
            key={id}
            className={cn(barWidth, 'rounded-[1px] transition-colors', active ? color : 'bg-gray-100')}
            style={{ height }}
          />
        )
      })}
    </div>
  )
}
