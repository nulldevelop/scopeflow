import React from 'react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  userName?: string
  children?: React.ReactNode
  className?: string
  icon?: React.ElementType
}

export function Header({
  title = '',
  subtitle,
  userName,
  children,
  className,
  icon: Icon,
}: HeaderProps) {
  const firstName = userName ? userName.split(' ')[0] : 'Usuário'

  const displayTitle = title?.includes('[nome]')
    ? title?.replace('[nome]', firstName)
    : title || ''

  return (
    <header
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-brand/90 px-8 pt-16 pb-28',
        className,
      )}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-light/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                <Icon className="w-7 h-7 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {displayTitle}
              </h1>
              {subtitle && (
                <p className="text-white/60 text-sm mt-1 max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {children && (
            <div className="flex items-center gap-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
