'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#D3D1C7]/50'
          : 'bg-transparent'
      }`}
    >
      <div className="flex flex-row items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <svg
              width="40"
              height="40"
              viewBox="0 0 60 60"
              fill="none"
              className="transition-transform duration-300 group-hover:scale-105"
            >
              <rect width="60" height="60" rx="14" fill="#2A6B5C" />
              <rect
                x="13"
                y="34"
                width="7"
                height="13"
                rx="2"
                fill="white"
                opacity="0.4"
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
            <div className="absolute inset-0 rounded-xl bg-[#2A6B5C] opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
          </div>

          <div className="hidden sm:block">
            <div className="flex flex-row gap-1 text-lg font-semibold tracking-tight">
              <span className="text-[#1C1C1A] group-hover:text-[#2A6B5C] transition-colors">
                Scope
              </span>
              <span className="text-[#2A6B5C]">Flow</span>
            </div>
          </div>
        </a>

        {/* Menu */}
        <nav className="hidden md:flex flex-row gap-1">
          {[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Orçamentos', href: '/orcamentos' },
            { label: 'Catálogo', href: '/catalogo' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative px-4 py-2 text-sm font-medium text-[#5F5E5A] hover:text-[#2A6B5C] transition-colors group"
            >
              {item.label}
              <span className="absolute inset-x-4 -bottom-1 h-0.5 bg-[#2A6B5C] scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-[#5F5E5A] hover:text-[#2A6B5C] hover:bg-[#EAF3EF] hidden sm:flex"
            >
              Entrar
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-[#2A6B5C] hover:bg-[#1A4A3E] text-white shadow-lg shadow-[#2A6B5C]/20 hover:shadow-xl hover:shadow-[#2A6B5C]/30 transition-all hover:-translate-y-0.5">
              Começar grátis
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
