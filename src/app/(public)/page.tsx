import type { Metadata } from 'next'
import { Features } from '@/components/features'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'
import { Navbar } from '@/components/navbar'
import { Pricing } from '@/components/pricing'
import { QuoteExample } from '@/components/quote-example'
import { prisma } from '@/lib/prisma'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://scopeflow.com.br'

export const metadata: Metadata = {
  title: 'ScopeFlow — Gerador de Propostas e Contratos para Devs',
  description:
    'Crie propostas comerciais profissionais, calcule valores por hora e gere contratos digitais em minutos. Feito para desenvolvedores freelancers e software houses brasileiras.',
  alternates: { canonical: baseUrl },
  openGraph: {
    title: 'ScopeFlow — Gerador de Propostas e Contratos para Devs',
    description:
      'Crie propostas comerciais profissionais, calcule valores por hora e gere contratos digitais em minutos.',
    url: baseUrl,
    type: 'website',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'ScopeFlow',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.svg`,
      },
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'ScopeFlow',
      description: 'Gerador de propostas e contratos para desenvolvedores',
      publisher: { '@id': `${baseUrl}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${baseUrl}/signin` },
        'query-input': 'required',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${baseUrl}/#app`,
      name: 'ScopeFlow',
      url: baseUrl,
      description:
        'Plataforma SaaS para desenvolvedores freelancers criarem propostas comerciais, calcularem preços e gerenciarem contratos digitais.',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
        description: 'Plano gratuito disponível',
      },
      audience: {
        '@type': 'Audience',
        audienceType: 'Desenvolvedores freelancers e software houses',
      },
      inLanguage: 'pt-BR',
      publisher: { '@id': `${baseUrl}/#organization` },
    },
  ],
}

export default async function Home() {
  const [
    totalUsers,
    totalQuotes,
    totalValueResult,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.quote.count(),
    prisma.quote.aggregate({
      _sum: { totalValue: true },
    }),
    prisma.user.findMany({
      where: { image: { not: null } },
      select: { image: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const totalValue = totalValueResult._sum.totalValue ?? 0
  const userAvatars = recentUsers.map((u) => u.image!)

  return (
    <main className="min-h-screen bg-[#F8F7F3]">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled server-side JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <Hero
        totalUsers={totalUsers}
        totalQuotes={totalQuotes}
        totalValue={Number(totalValue)}
        userAvatars={userAvatars}
      />
      <Features />
      <QuoteExample />
      <Pricing />
      <Footer />
    </main>
  )
}
