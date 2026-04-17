import {
  Library,
  Calculator,
  FileText,
  TrendingUp,
  Users,
  Search,
} from 'lucide-react'
import { MagicCard } from '@/components/magicui/magic-card'

const features = [
  {
    icon: <Library className="w-5 h-5 text-brand" />,
    title: 'Catálogo de funcionalidades',
    description:
      'Cadastre uma vez, reutilize em todos os projetos. Cada item tem horas estimadas, complexidade e categoria.',
  },
  {
    icon: <Calculator className="w-5 h-5 text-brand" />,
    title: 'Cálculo automático',
    description:
      'Horas, custo total e prazo calculados automaticamente com base no seu valor/hora configurado.',
  },
  {
    icon: <FileText className="w-5 h-5 text-brand" />,
    title: 'Motor de negociação',
    description:
      'Aplique descontos, acréscimos por urgência, defina entrada e parcelamento diretamente no orçamento.',
  },
  {
    icon: <Search className="w-5 h-5 text-brand" />,
    title: 'Propostas profissionais',
    description:
      'Gere propostas visualmente atrativas para compartilhar por link ou exportar em PDF.',
  },
  {
    icon: <Users className="w-5 h-5 text-brand" />,
    title: 'Histórico e gestão',
    description:
      'Armazene todos os orçamentos, organize por cliente e acompanhe o status de cada proposta.',
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-brand" />,
    title: 'Métricas e insights',
    description:
      'Taxa de conversão, ticket médio e projetos mais lucrativos — dados para cobrar melhor com o tempo.',
  },
]

export function Features() {
  return (
    <section className="py-20 px-6 bg-[#F8F7F3]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#1C1C1A] mb-4">
            Tudo que você precisa para precificar
          </h2>
          <p className="text-[#5F5E5A] max-w-xl mx-auto">
            Uma solução completa para transformar a forma como você cria e
            gerencia orçamentos de software.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <MagicCard
              key={index}
              className="bg-white border border-[#D3D1C7] rounded-xl p-6 hover:border-[#2A6B5C]/30 transition-colors"
              gradientColor="#2A6B5C"
              gradientOpacity={0.05}
            >
              <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-[#1C1C1A] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#888780] leading-relaxed">
                {feature.description}
              </p>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  )
}
