'use client'

import { Button } from '@/components/ui/button'
import { Meteors } from '@/components/magicui/meteors'
import { motion } from 'framer-motion'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { HeroVideoDialog } from '@/components/magicui/hero-video-dialog'

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  }

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0E2E26] px-6 py-24 md:py-32">
      <Meteors number={25} />
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#2A6B5C]/20 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#1A4A3E]/30 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-5xl mx-auto text-center"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-[11px] font-bold tracking-[0.2em] uppercase rounded-full border border-white/10 bg-white/5 text-[#9BBFB8] backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2A6B5C] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2A6B5C]"></span>
          </span>
          Revolução na Precificação
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.05]"
        >
          Propostas que
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9BBFB8] via-white to-[#2A6B5C]">encantam clientes.</span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
        >
          Abandone as planilhas. Gere orçamentos técnicos e comerciais com inteligência, 
          baseados no seu catálogo de funcionalidades e valor/hora real.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <Button size="lg" className="bg-[#2A6B5C] hover:bg-[#1f5045] text-white hover:text-white px-10 py-7 text-base font-semibold rounded-2xl shadow-2xl shadow-[#2A6B5C]/20 group transition-all">
            Criar orçamento grátis
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <HeroVideoDialog
            animationStyle="from-center"
            videoSrc="https://www.youtube.com/embed/qh3NGpYIdh4?si=W8f8j-vXG0l4lFqX" // URL de exemplo
          >
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/5 hover:text-white px-10 py-7 text-base font-medium rounded-2xl gap-2"
            >
              <PlayCircle className="w-6 h-6 text-[#9BBFB8]" />
              Ver demonstração
            </Button>
          </HeroVideoDialog>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-3 items-center justify-center gap-8 mt-24 pt-12 border-t border-white/5"
        >
          <div className="group cursor-default">
            <div className="text-3xl font-bold text-white group-hover:text-[#9BBFB8] transition-colors">50%</div>
            <div className="text-xs text-white/40 mt-2 font-medium tracking-wide uppercase">
              Economia de Tempo
            </div>
          </div>
          <div className="group cursor-default">
            <div className="text-3xl font-bold text-white group-hover:text-[#9BBFB8] transition-colors">+20%</div>
            <div className="text-xs text-white/40 mt-2 font-medium tracking-wide uppercase">
              Taxa de Fechamento
            </div>
          </div>
          <div className="group cursor-default col-span-2 md:col-span-1">
            <div className="text-3xl font-bold text-white group-hover:text-[#9BBFB8] transition-colors">100%</div>
            <div className="text-xs text-white/40 mt-2 font-medium tracking-wide uppercase">
              White Label Profissional
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

