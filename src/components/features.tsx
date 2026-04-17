const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="3" rx="1.5" fill="#2A6B5C" />
        <rect
          x="2"
          y="9"
          width="11"
          height="3"
          rx="1.5"
          fill="#2A6B5C"
          opacity="0.6"
        />
        <rect
          x="2"
          y="14"
          width="7"
          height="3"
          rx="1.5"
          fill="#2A6B5C"
          opacity="0.35"
        />
      </svg>
    ),
    title: 'Catálogo de funcionalidades',
    description:
      'Cadastre uma vez, reutilize em todos os projetos. Cada item tem horas estimadas, complexidade e categoria.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path
          d="M4 10h12M10 4v12"
          stroke="#2A6B5C"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle
          cx="10"
          cy="10"
          r="7"
          stroke="#2A6B5C"
          strokeWidth="1.2"
          opacity="0.4"
        />
      </svg>
    ),
    title: 'Cálculo automático',
    description:
      'Horas, custo total e prazo calculados automaticamente com base no seu valor/hora configurado.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <rect
          x="3"
          y="3"
          width="14"
          height="14"
          rx="3"
          stroke="#2A6B5C"
          strokeWidth="1.3"
          opacity="0.5"
        />
        <path
          d="M7 10l2.5 2.5L13 7"
          stroke="#2A6B5C"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: 'Motor de negociação',
    description:
      'Aplique descontos, acréscimos por urgência, defina entrada e parcelamento diretamente no orçamento.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path
          d="M5 17V8l5-5 5 5v9"
          stroke="#2A6B5C"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
        <rect x="8" y="12" width="4" height="5" rx="1" fill="#2A6B5C" />
      </svg>
    ),
    title: 'Propostas profissionais',
    description:
      'Gere propostas visualmente atrativas para compartilhar por link ou exportar em PDF.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10"
          cy="10"
          r="7"
          stroke="#2A6B5C"
          strokeWidth="1.3"
          opacity="0.5"
        />
        <path
          d="M10 6v4l3 3"
          stroke="#2A6B5C"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: 'Histórico e gestão',
    description:
      'Armazene todos os orçamentos, organize por cliente e acompanhe o status de cada proposta.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path
          d="M3 14l4-4 3 3 4-5 3 3"
          stroke="#2A6B5C"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
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

        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-[#D3D1C7] rounded-xl p-6 hover:border-[#2A6B5C]/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#EAF3EF] flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-sm font-medium text-[#1C1C1A] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#888780] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
