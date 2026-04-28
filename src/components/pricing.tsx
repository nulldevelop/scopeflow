'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'

const plans = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    description: 'Para quem está começando a organizar seus orçamentos.',
    features: [
      'Até 5 orçamentos ativos',
      'Catálogo de 20 funcionalidades',
      'Proposta em PDF profissional',
      'Histórico básico de propostas',
    ],
    buttonText: 'Começar agora',
    featured: false
  },
  {
    name: 'Pro',
    price: 'R$ 49',
    description: 'A solução completa para profissionais em crescimento.',
    features: [
      'Orçamentos ilimitados',
      'Catálogo ilimitado',
      'Link compartilhável dinâmico',
      'Métricas e taxa de conversão',
      'Regras de negociação avançadas',
      'Suporte prioritário',
    ],
    buttonText: 'Assinar Pro',
    featured: true
  },
  {
    name: 'Equipe',
    price: 'R$ 129',
    description: 'Gestão centralizada para times e pequenas agências.',
    features: [
      'Tudo do plano Pro',
      'Até 5 membros no time',
      'Templates personalizados',
      'Integração futura com contratos',
      'Painel administrativo',
    ],
    buttonText: 'Falar com vendas',
    featured: false
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-32 px-6 bg-[#F8F7F3]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-[#1C1C1A] mb-6"
          >
            Planos que crescem com você
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#5F5E5A] text-lg max-w-2xl mx-auto font-light"
          >
            Escolha a transparência e a agilidade. Mude de plano quando quiser.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative flex flex-col rounded-[2rem] p-8 md:p-10 transition-all duration-300 border ${
                plan.featured
                  ? 'bg-[#0E2E26] text-white border-[#2A6B5C] shadow-2xl scale-105 z-10'
                  : 'bg-white text-[#1C1C1A] border-[#D3D1C7]/60 shadow-sm'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#2A6B5C] text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl z-20">
                  <Sparkles className="w-3 h-3" />
                  Mais Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${plan.featured ? 'text-[#9BBFB8]' : 'text-[#888780]'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                  <span className={`text-sm font-light ${plan.featured ? 'text-white/60' : 'text-[#888780]'}`}>/mês</span>
                </div>
                <p className={`text-sm leading-relaxed font-light ${plan.featured ? 'text-white/70' : 'text-[#5F5E5A]'}`}>
                  {plan.description}
                </p>
              </div>

              <div className={`h-px w-full mb-8 ${plan.featured ? 'bg-white/10' : 'bg-[#D3D1C7]/30'}`} />

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-light">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.featured ? 'text-[#9BBFB8]' : 'text-[#2A6B5C]'}`} />
                    <span className={plan.featured ? 'text-white/80' : 'text-[#5F5E5A]'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className={`w-full h-14 rounded-xl text-base font-bold transition-all duration-300 ${
                  plan.featured
                    ? 'bg-[#2A6B5C] hover:bg-[#1f5045] text-white hover:text-white shadow-lg shadow-[#2A6B5C]/20'
                    : 'bg-[#F5F4F0] text-[#1C1C1A] hover:bg-[#ECEAE3] hover:text-[#1C1C1A] border border-[#D3D1C7]/50'
                }`}
              >
                {plan.buttonText}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
