import type { Metadata } from 'next'
import { Figtree, Geist, Geist_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { cn } from '@/lib/utils'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' })

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ScopeFlow - Gerenciador de Orçamentos',
  description:
    'ScopeFlow é um gerenciador de orçamentos que ajuda a organizar e controlar suas finanças de forma eficiente.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn(
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        figtree.variable,
      )}
    >
      <body>{children}</body>
    </html>
  )
}
