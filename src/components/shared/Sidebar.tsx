'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Library,
  Users,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useScopeFlow } from '@/context/ScopeFlowContext'

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Orçamentos', href: '/orcamentos', icon: FileText },
  { label: 'Catálogo', href: '/catalogo', icon: Library },
  { label: 'Clientes', href: '/clientes', icon: Users },
  { label: 'Configurações', href: '/configuracoes', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useScopeFlow()
  const [isOpen, setIsOpen] = React.useState(false)

  const Logo = () => (
    <div className="flex items-center gap-3">
      <svg width="32" height="32" viewBox="0 0 60 60" fill="none">
        <rect width="60" height="60" rx="14" fill="#2A6B5C" />
        <rect
          x="13"
          y="34"
          width="7"
          height="13"
          rx="2"
          fill="white"
          opacity="0.40"
        />
        <rect
          x="23"
          y="26"
          width="7"
          height="21"
          rx="2"
          fill="white"
          opacity="0.65"
        />
        <rect x="33" y="17" width="7" height="30" rx="2" fill="white" />
        <path
          d="M39 14 L46 8 M46 8 L41.5 8 M46 8 L46 12.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-semibold text-lg tracking-tight text-gray-900">
        ScopeFlow
      </span>
    </div>
  )

  return (
    <>
      {/* Mobile Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <Logo />
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-light text-brand'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <item.icon
                    className={cn(
                      'w-4 h-4',
                      isActive ? 'text-brand' : 'text-gray-400',
                    )}
                  />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-brand font-semibold text-xs">
                  {user.nome.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.nome}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
