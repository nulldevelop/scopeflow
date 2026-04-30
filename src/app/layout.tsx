import type { Metadata } from 'next'
import { IBM_Plex_Mono, Sora } from 'next/font/google'
import '@/styles/globals.css'
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

export const metadata: Metadata = {
  title: 'ScopeFlow - Precificação Inteligente',
  description:
    'A plataforma de precificação inteligente para desenvolvedores freelancers e pequenas software houses.',
  icons: {
    icon: '/logo.svg',
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
        <Toaster />
      </body>
    </html>
  )
}
