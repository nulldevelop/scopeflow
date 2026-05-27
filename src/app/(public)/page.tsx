import { Features } from '@/components/features'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'
import { Navbar } from '@/components/navbar'
import { Pricing } from '@/components/pricing'
import { QuoteExample } from '@/components/quote-example'
import { prisma } from '@/lib/prisma'

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
