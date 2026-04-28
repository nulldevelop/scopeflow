'use client'

import Link from 'next/link'

const socialIcons = [
  { name: 'Twitter', path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5c6 3 13 0 13-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
  { name: 'Instagram', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' },
  { name: 'Linkedin', path: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z' },
  { name: 'Github', path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' }
]

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
              {socialIcons.map((icon) => (
                <a key={icon.name} href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-[#9BBFB8] hover:bg-white/10 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={icon.path} />
                  </svg>
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
              <button className="absolute right-2 top-2 px-3 py-1 text-xs font-bold bg-[#2A6B5C] text-white rounded-lg hover:bg-[#1f5045] hover:text-white transition-colors">
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
