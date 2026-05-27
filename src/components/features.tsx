'use client'

import { motion, type Variants } from 'framer-motion'
import {
  Calculator,
  FileText,
  Library,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react'
import { MagicCard } from '@/components/magicui/magic-card'

const features = [
  {
    icon: <Library className="w-6 h-6" />,
    title: 'Catálogo de funcionalidades',
    description:
      'Cadastre uma vez, reutilize em todos os projetos. Cada item tem horas estimadas, complexidade e categoria.',
  },
  {
    icon: <Calculator className="w-6 h-6" />,
    title: 'Cálculo automático',
    description:
      'Horas, custo total e prazo calculados automaticamente com base no seu valor/hora configurado.',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Motor de negociação',
    description:
      'Aplique descontos, acréscimos por urgência, defina entrada e parcelamento diretamente no orçamento.',
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: 'Propostas profissionais',
    description:
      'Gere propostas visualmente atrativas para compartilhar por link ou exportar em PDF.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Histórico e gestão',
    description:
      'Armazene todos os orçamentos, organize por cliente e acompanhe o status de cada proposta.',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Métricas e insights',
    description:
      'Taxa de conversão, ticket médio e projetos mais lucrativos — dados para cobrar melhor com o tempo.',
  },
]

export function Features() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  return (
    <section id="features" className="py-32 px-6 bg-[#F8F7F3]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1C1C1A] mb-6">
            Tudo que você precisa para precificar
          </h2>
          <p className="text-[#5F5E5A] text-lg max-w-2xl mx-auto font-light">
            Uma solução completa para transformar a forma como você cria e
            gerencia orçamentos de software, do catálogo à proposta final.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index.toString()} variants={itemVariants}>
              <MagicCard
                className="group relative bg-white border border-[#D3D1C7]/50 rounded-3xl p-8 hover:border-[#2A6B5C]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[#2A6B5C]/5"
                gradientColor="#F1F5F0"
              >
                <div className="mb-6 w-14 h-14 rounded-2xl bg-[#2A6B5C]/5 flex items-center justify-center text-[#2A6B5C] group-hover:scale-110 group-hover:bg-[#2A6B5C] group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-[#1C1C1A] mb-3 group-hover:text-[#2A6B5C] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[#5F5E5A] text-sm leading-relaxed font-light">
                  {feature.description}
                </p>
              </MagicCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
