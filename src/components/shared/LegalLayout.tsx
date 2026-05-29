import Link from 'next/link'
import type React from 'react'
import { Footer } from '@/components/footer'

export function LegalLayout({
  title,
  updatedAt,
  children,
}: {
  title: string
  updatedAt: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#F8F7F3]">
      <header className="sticky top-0 z-30 border-b border-gray-200/60 bg-white/80 backdrop-blur">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <svg width="28" height="28" viewBox="0 0 60 60" fill="none">
              <title>ScopeFlow</title>
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
            </svg>
            <span className="font-black tracking-tight text-gray-900">
              ScopeFlow
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Voltar ao site
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-3">
          {title}
        </h1>
        <p className="text-sm text-gray-400 mb-12">
          Última atualização: {updatedAt}
        </p>

        <div className="space-y-5 text-[15px] leading-relaxed text-gray-600 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:pt-6 [&_p]:text-gray-600 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-gray-600 [&_a]:text-brand [&_a]:underline [&_strong]:text-gray-900 [&_strong]:font-semibold">
          {children}
        </div>
      </article>

      <Footer />
    </main>
  )
}
