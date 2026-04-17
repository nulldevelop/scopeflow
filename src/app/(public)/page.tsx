import { Features } from '@/components/features'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'
import { Navbar } from '@/components/navbar'
import { Pricing } from '@/components/pricing'
import { QuoteExample } from '@/components/quote-example'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F7F3]">
      <Navbar />
      <Hero />
      <Features />
      <QuoteExample />
      <Pricing />
      <Footer />
    </main>
  )
}
