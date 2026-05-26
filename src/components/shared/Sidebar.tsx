'use client'

import {
  ChevronRight,
  FileText,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

interface SidebarProps {
  user: {
    name: string
    email: string
    image?: string | null | undefined
  } | null
  userRole?: string
}

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Orçamentos', href: '/dashboard/orcamentos', icon: FileText },
  { label: 'Catálogo', href: '/dashboard/catalogo', icon: Library },
  { label: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { label: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
]

const Logo = () => (
  <div className="flex items-center gap-3 group px-2">
    <div className="relative">
      <div className="absolute inset-0 bg-brand/20 blur-lg rounded-full group-hover:bg-brand/40 transition-all" />
      <svg
        width="32"
        height="32"
        viewBox="0 0 60 60"
        fill="none"
        className="relative"
        aria-hidden="true"
      >
        <title>ScopeFlow</title>
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
      </svg>
    </div>
    <span className="font-black text-xl tracking-tight text-white uppercase group-hover:text-brand-light transition-colors">
      ScopeFlow
    </span>
  </div>
)

export function Sidebar({ user, userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)

  const allMenuItems =
    userRole === 'owner'
      ? [
          ...menuItems,
          { label: 'Owner', href: '/dashboard/owner', icon: Shield },
        ]
      : menuItems

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/signin')
        },
      },
    })
  }

  return (
    <>
      {/* Mobile Trigger */}
      <Button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 p-0 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg flex items-center justify-center hover:bg-white transition-all active:scale-95"
      >
        <Menu className="w-5 h-5 text-gray-900" />
      </Button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-40 lg:hidden w-full h-full border-none p-0 cursor-default"
          onClick={() => setIsOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-[#0F1115] border-r border-white/5 transform transition-all duration-300 ease-in-out lg:translate-x-0 shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-brand/5 to-transparent pointer-events-none" />

        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="p-8 flex items-center justify-between">
            <Logo />
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              className="lg:hidden p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto no-scrollbar">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
              Menu Principal
            </p>
            {allMenuItems.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'group flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 relative overflow-hidden',
                    isActive
                      ? 'bg-brand text-white shadow-lg shadow-brand/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5',
                  )}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                        isActive
                          ? 'bg-white/20'
                          : 'bg-white/5 group-hover:bg-white/10',
                      )}
                    >
                      <item.icon
                        className={cn(
                          'w-4 h-4',
                          isActive
                            ? 'text-white'
                            : 'text-gray-400 group-hover:text-white',
                        )}
                      />
                    </div>
                    {item.label}
                  </div>
                  {isActive ? (
                    <ChevronRight className="w-4 h-4 text-white/60 relative z-10" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all relative z-10" />
                  )}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-dark opacity-90" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer User Profile */}
          <div className="p-4 mt-auto">
            <div className="bg-white/5 rounded-[28px] p-4 border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-brand/20 flex items-center justify-center overflow-hidden border border-brand/30">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <span className="text-brand font-black text-lg">
                        {user?.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0F1115] rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate font-medium uppercase tracking-tighter">
                    {userRole === 'owner' ? 'Administrator' : 'Membro'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  variant="ghost"
                  className="h-10 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs border border-white/5"
                >
                  <Link href="/dashboard/configuracoes">
                    <Settings className="w-3.5 h-3.5 mr-2" />
                    Ajustes
                  </Link>
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="h-10 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500 hover:text-red-400 transition-all text-xs border border-red-500/10"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
