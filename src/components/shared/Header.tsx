import React from 'react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  userName?: string
  children?: React.ReactNode
  className?: string
}

export function Header({ title = '', subtitle, userName, children, className }: HeaderProps) {
  const firstName = userName ? userName.split(' ')[0] : 'Usuário'

  const displayTitle = title?.includes('[nome]')
    ? title?.replace('[nome]', firstName)
    : title || ''

  return (
    <header className={cn("relative overflow-hidden bg-[#0F1115] border-b border-white/5 px-8 pt-12 pb-20 mb-8", className)}>
      {/* Decorative Background Elements from Sidebar style */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-brand/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
            {displayTitle}
          </h1>
          {subtitle && (
            <p className="text-gray-400 text-sm mt-2 max-w-2xl font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {children}
        </div>
      </div>
    </header>
  )
}
