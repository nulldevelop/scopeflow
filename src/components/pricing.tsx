'use client'

import { Button } from '@/components/ui/button'
import { MagicCard } from '@/components/magicui/magic-card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    period: '/mês',
    description: 'Ideal para freelancers começando agora.',
    features: [
      'Até 5 orçamentos ativos',
      'Catálogo de 20 funcionalidades',
      'Proposta em PDF profissional',
      'Histórico básico de propostas',
    ],
  },
  {
    name: 'Pro',
    price: 'R$ 49',
    period: '/mês',
    description: 'Para profissionais que buscam escala.',
    featured: true,
    features: [
      'Orçamentos ilimitados',
      'Catálogo ilimitado',
      'Link compartilhável dinâmico',
      'Métricas e taxa de conversão',
      'Regras de negociação avançadas',
      'Suporte via chat',
    ],
  },
  {
    name: 'Equipe',
    price: 'R$ 129',
    period: '/mês',
    description: 'Para times e pequenas agências.',
    features: [
      'Tudo do plano Pro',
      'Até 5 membros no time',
      'Templates personalizados',
      'Integração futura com contratos',
      'Suporte prioritário 24/7',
    ],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-32 px-6 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#D3D1C7]/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1C1C1A] mb-6">
            Planos que crescem com você
          </h2>
          <p className="text-[#5F5E5A] text-lg max-w-2xl mx-auto font-light">
            Transparência total desde o início. Escolha o plano que melhor se adapta ao seu momento profissional.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex"
            >
              <MagicCard
                className={`relative flex flex-col w-full bg-white rounded-[2.5rem] p-10 transition-all duration-500 border ${
                  plan.featured
                    ? 'border-[#2A6B5C]/50 shadow-2xl shadow-[#2A6B5C]/10 scale-105 z-10'
                    : 'border-[#D3D1C7]/40'
                }`}
                gradientColor={plan.featured ? '#2A6B5C' : '#D3D1C7'}
                gradientOpacity={plan.featured ? 0.08 : 0.05}
              >
                {plan.featured && (
                  <>
                    <BorderBeam size={350} duration={15} colorFrom="#2A6B5C" colorTo="#9BBFB8" borderWidth={2} />
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full bg-[#2A6B5C] text-white z-20 shadow-lg shadow-[#2A6B5C]/20">
                      Mais Popular
                    </div>
                  </>
                )}

                <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#888780] mb-4">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-5xl font-bold text-[#1C1C1A]">
                      {plan.price}
                    </span>
                    <span className="text-lg text-[#888780] font-light">{plan.period}</span>
                  </div>
                  <p className="text-sm text-[#5F5E5A] font-light italic">
                    {plan.description}
                  </p>
                </div>

                <div className="h-px bg-[#D3D1C7]/30 w-full mb-8" />

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-[#5F5E5A] font-light"
                    >
                      <div className={`mt-0.5 rounded-full p-0.5 ${plan.featured ? 'bg-[#2A6B5C]/10 text-[#2A6B5C]' : 'bg-[#D3D1C7]/30 text-[#888780]'}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`w-full h-14 rounded-2xl text-base font-bold transition-all duration-300 ${
                    plan.featured
                      ? 'bg-[#2A6B5C] hover:bg-[#1f5045] text-white shadow-xl shadow-[#2A6B5C]/20'
                      : 'bg-[#F5F4F0] text-[#1C1C1A] hover:bg-[#ECEAE3] border border-[#D3D1C7]/50'
                  }`}
                >
                  {plan.name === 'Grátis' ? 'Começar Agora' : 'Assinar Plano'}
                </Button>
              </MagicCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

