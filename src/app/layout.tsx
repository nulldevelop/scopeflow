import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { IBM_Plex_Mono, Sora } from 'next/font/google'
import type React from 'react'
import '@/styles/globals.css'
import { CookieBanner } from '@/components/shared/CookieBanner'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sora',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.scopeflow.dev.br'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'ScopeFlow — Gerador de Propostas e Contratos para Devs',
    template: '%s | ScopeFlow',
  },
  description:
    'Crie propostas comerciais, calcule valores por hora e gere contratos digitais em minutos. A plataforma de precificação inteligente para desenvolvedores freelancers e software houses.',
  keywords: [
    'proposta comercial',
    'precificação freelancer',
    'contrato digital',
    'orçamento desenvolvimento',
    'software house',
    'freelancer desenvolvedor',
    'gerador de proposta',
    'proposta de software',
    'contrato de prestação de serviços',
  ],
  authors: [{ name: 'ScopeFlow' }],
  creator: 'ScopeFlow',
  publisher: 'ScopeFlow',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: baseUrl,
    siteName: 'ScopeFlow',
    title: 'ScopeFlow — Gerador de Propostas e Contratos para Devs',
    description:
      'Crie propostas comerciais, calcule valores por hora e gere contratos digitais em minutos.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ScopeFlow — Gerador de Propostas para Desenvolvedores',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScopeFlow — Gerador de Propostas e Contratos para Devs',
    description:
      'Crie propostas comerciais, calcule valores por hora e gere contratos digitais em minutos.',
    images: ['/og-image.png'],
    creator: '@scopeflow',
  },
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo.svg',
  },
  alternates: {
    canonical: baseUrl,
  },
  verification: {
    google: 'google44b65a859e6c7576',
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
      suppressHydrationWarning
      className={cn(
        sora.variable,
        ibmPlexMono.variable,
        'font-sans antialiased',
      )}
    >
      <body className="font-sans">
        {children}
        <CookieBanner />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
