'use client'

import { motion } from 'framer-motion'
import { Instagram, Linkedin, Twitter, Github } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0E2E26] px-6 pt-24 pb-12 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-[#2A6B5C]/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <svg width="32" height="32" viewBox="0 0 60 60" fill="none">
                <rect width="60" height="60" rx="14" fill="#2A6B5C" />
                <rect x="13" y="34" width="7" height="13" rx="2" fill="white" opacity="0.4" />
                <rect x="23" y="26" width="7" height="21" rx="2" fill="white" opacity="0.65" />
                <rect x="33" y="17" width="7" height="30" rx="2" fill="white" />
                <path d="M39 14 L46 8 M46 8 L41.5 8 M46 8 L46 12.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-white text-xl font-bold tracking-tight">ScopeFlow</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-xs font-light">
              Transformando a precificação de projetos de software em uma vantagem competitiva para freelancers e agências.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-[#9BBFB8] hover:bg-white/10 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Plataforma</h4>
            <ul className="space-y-4">
              {['Funcionalidades', 'Preços', 'Demonstração', 'Roadmap'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors font-light">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Recursos</h4>
            <ul className="space-y-4">
              {['Documentação', 'Guia de Precificação', 'Blog', 'Suporte'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors font-light">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Newsletter</h4>
            <p className="text-white/50 text-sm mb-6 font-light">Receba dicas de gestão e precificação toda semana.</p>
            <form className="relative">
              <input 
                type="email" 
                placeholder="Seu melhor e-mail" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#2A6B5C] transition-colors"
              />
              <button className="absolute right-2 top-2 px-3 py-1 text-xs font-bold bg-[#2A6B5C] text-white rounded-lg hover:bg-[#1f5045] transition-colors">
                Assinar
              </button>
            </form>
          </div>
        </div>

        <div className="h-px bg-white/5 w-full mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-medium uppercase tracking-widest text-white/30">
          <p>© {currentYear} ScopeFlow Labs. Todos os direitos reservados.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

