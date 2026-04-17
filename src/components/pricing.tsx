import { Button } from '@/components/ui/button'

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
            Planes que crescem com você
          </h2>
          <p className="text-[#5F5E5A] max-w-xl mx-auto">
            Escolha o plano que melhor se adapta às suas necessidades.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-xl p-6 ${
                plan.featured
                  ? 'border-2 border-[#2A6B5C] shadow-lg'
                  : 'border border-[#D3D1C7]'
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full bg-[#2A6B5C] text-white">
                  Popular
                </span>
              )}

              <div className="text-center mb-6">
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

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-[#5F5E5A]"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#2A6B5C] mt-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.featured
                    ? 'bg-[#2A6B5C] hover:bg-[#1A4A3E] text-white'
                    : 'bg-[#F5F4F0] text-[#5F5E5A] hover:bg-[#ECEAE3]'
                }`}
              >
                {plan.name === 'Grátis' ? 'Começar grátis' : 'Assinar'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
