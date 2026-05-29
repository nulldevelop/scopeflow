'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'scopeflow-cookie-consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Só mostra se o usuário ainda não reconheceu o aviso.
    if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 inset-x-4 z-[200] md:left-auto md:right-6 md:max-w-md">
      <div className="bg-[#0E2E26] text-white rounded-2xl shadow-2xl border border-white/10 p-5">
        <p className="text-sm leading-relaxed text-white/80">
          Usamos apenas{' '}
          <strong className="text-white">cookies essenciais</strong> para manter
          seu login e o funcionamento da plataforma. Não usamos cookies de
          rastreamento ou publicidade.{' '}
          <Link
            href="/cookies"
            className="text-[#9BBFB8] underline hover:text-white transition-colors"
          >
            Saiba mais
          </Link>
          .
        </p>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="px-5 py-2 rounded-xl bg-[#2A6B5C] hover:bg-[#1f5045] text-white text-sm font-bold transition-colors active:scale-95"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  )
}
