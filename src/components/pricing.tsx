import { Button } from '@/components/ui/button'
import { MagicCard } from '@/components/magicui/magic-card'
import { BorderBeam } from '@/components/magicui/border-beam'

const plans = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    period: '/mês',
    description: 'Ideal para começar',
    features: [
      'Até 5 orçamentos ativos',
      'Catálogo de até 20 funcionalidades',
      'Proposta em PDF',
      'Histórico básico',
    ],
  },
  {
    name: 'Pro',
    price: 'R$ 49',
    period: '/mês',
    description: 'Para profissionais',
    featured: true,
    features: [
      'Orçamentos ilimitados',
      'Catálogo ilimitado',
      'Link compartilhável de proposta',
      'Métricas e taxa de conversão',
      'Regras de negociação avançadas',
    ],
  },
  {
    name: 'Equipe',
    price: 'R$ 129',
    period: '/mês',
    description: 'Para times',
    features: [
      'Tudo do Pro',
      'Múltiplos usuários',
      'Templates de proposta personalizados',
      'Integração futura com contratos',
      'Suporte prioritário',
    ],
  },
]

export function Pricing() {
  return (
    <section className="py-20 px-6 bg-[#F8F7F3]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#1C1C1A] mb-4">
            Planos que crescem com você
          </h2>
          <p className="text-[#5F5E5A] max-w-xl mx-auto">
            Escolha o plano que melhor se adapta às suas necessidades.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <MagicCard
              key={index}
              className={`relative bg-white rounded-xl p-6 flex flex-col ${
                plan.featured
                  ? 'border-[#2A6B5C]/50 shadow-lg'
                  : 'border-[#D3D1C7]'
              }`}
              gradientColor={plan.featured ? '#2A6B5C' : '#D3D1C7'}
            >
              {plan.featured && (
                <>
                  <BorderBeam size={250} duration={12} delay={9} />
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full bg-[#2A6B5C] text-white z-20">
                    Popular
                  </span>
                </>
              )}

              <div className="text-center mb-6 relative z-10">
                <p className="text-xs font-medium uppercase tracking-wider text-[#888780] mb-2">
                  {plan.name}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-semibold text-[#1C1C1A]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#888780]">{plan.period}</span>
                </div>
                <p className="text-xs text-[#888780] mt-2">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1 relative z-10">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-[#5F5E5A]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2A6B5C] mt-1.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full relative z-10 ${
                  plan.featured
                    ? 'bg-[#2A6B5C] hover:bg-[#1A4A3E] text-white'
                    : 'bg-[#F5F4F0] text-[#5F5E5A] hover:bg-[#ECEAE3]'
                }`}
              >
                {plan.name === 'Grátis' ? 'Começar grátis' : 'Assinar'}
              </Button>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  )
}
