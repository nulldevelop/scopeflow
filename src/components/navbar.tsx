'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.1)] border-b border-[#D3D1C7]/30 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="flex flex-row items-center justify-between px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group relative z-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <svg
              width="38"
              height="38"
              viewBox="0 0 60 60"
              fill="none"
              className="drop-shadow-sm"
            >
              <title>ScopeFlow Logo</title>
              <rect width="60" height="60" rx="16" fill="#2A6B5C" />
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
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="absolute inset-0 rounded-2xl bg-[#2A6B5C] opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />
          </motion.div>

          <div className="hidden sm:block overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-row gap-0.5 text-xl font-bold tracking-tight"
            >
              <span className="text-[#1C1C1A]">
                Scope
              </span>
              <span className="text-[#2A6B5C]">Flow</span>
            </motion.div>
          </div>
        </Link>

        {/* Menu */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F5F4F0]/50 p-1 rounded-full border border-[#D3D1C7]/20">
          {[
            { label: 'Recursos', href: '#features' },
            { label: 'Preços', href: '#pricing' },
            { label: 'Demonstração', href: '#demo' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative px-5 py-2 text-sm font-medium text-[#5F5E5A] hover:text-[#2A6B5C] transition-colors rounded-full group overflow-hidden"
            >
              <span className="relative z-10">{item.label}</span>
              <motion.span 
                className="absolute inset-0 bg-[#2A6B5C]/5 opacity-0 group-hover:opacity-100 transition-opacity"
                layoutId="nav-hover"
              />
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/signin" className="hidden sm:block text-sm font-medium text-[#5F5E5A] hover:text-[#1C1C1A] transition-colors px-4">
            Entrar
          </Link>
          <Link href="/signin">
            <Button className="bg-[#2A6B5C] hover:bg-[#1A4A3E] text-white px-6 rounded-full shadow-lg shadow-[#2A6B5C]/20 hover:shadow-xl hover:shadow-[#2A6B5C]/30 transition-all active:scale-95">
              Começar grátis
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

