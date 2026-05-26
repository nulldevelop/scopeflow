'use client'

import { motion, type Variants } from 'framer-motion'
import { ArrowRight, ChevronRight, Play, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0E2E26] px-6 py-24 md:py-32">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#2A6B5C]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#9BBFB8]/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-5xl mx-auto text-center"
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-[#0E2E26] bg-gray-200 overflow-hidden"
              >
                <img
                  src={`https://i.pravatar.cc/100?img=${i + 10}`}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <span className="text-white/60 text-xs font-medium tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9BBFB8] animate-pulse" />
            Join 1,000+ software developers
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-white tracking-tight leading-[0.95] mb-8"
        >
          Do código à proposta <br className="hidden md:block" />
          em <span className="text-[#9BBFB8]">segundos.</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-[#9BBFB8]/70 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
        >
          A ferramenta definitiva para desenvolvedores e software houses que
          buscam profissionalismo, precisão e velocidade na criação de
          orçamentos.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="h-16 px-8 rounded-2xl bg-[#9BBFB8] text-[#0E2E26] hover:bg-white transition-all text-lg font-bold group shadow-xl shadow-[#9BBFB8]/10"
          >
            <Link href="/signin">
              Começar Grátis
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="h-16 px-8 rounded-2xl text-white hover:bg-white/5 text-lg font-medium gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Play className="w-4 h-4 fill-white" />
            </div>
            Ver Demo
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}
