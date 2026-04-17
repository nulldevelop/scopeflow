export function QuoteExample() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#1C1C1A] mb-4">
            Informações claras para todos
          </h2>
          <p className="text-[#5F5E5A]">
            Você e seu cliente visualizam as mesmas informações, com
            transparência total.
          </p>
        </div>

        <div className="bg-white border border-[#D3D1C7] rounded-2xl p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-base font-medium text-[#1C1C1A]">
                App de gestão financeira
              </h3>
              <p className="text-sm text-[#888780] mt-1">
                Empresa XYZ · criado em 12 abr 2026
              </p>
            </div>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#E6F1FB] text-[#0C447C]">
              Enviada
            </span>
          </div>

          <div className="h-px bg-[#ECEAE3] my-6" />

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mb-6">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#888780] mb-1">
                Total
              </p>
              <p className="text-2xl font-medium text-[#2A6B5C]">R$ 18.200</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#888780] mb-1">
                Prazo
              </p>
              <p className="text-2xl font-medium text-[#1C1C1A]">8 sem.</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#888780] mb-1">
                Horas
              </p>
              <p className="text-2xl font-medium text-[#1C1C1A]">182h</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#888780] mb-1">
                Módulos
              </p>
              <p className="text-2xl font-medium text-[#1C1C1A]">6</p>
            </div>
          </div>

          <div className="h-px bg-[#ECEAE3] my-6" />

          {/* Footer */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <p className="text-sm text-[#888780]">
              Entrada: R$ 5.000 · 3× R$ 4.400
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm rounded-lg border border-[#D3D1C7] text-[#5F5E5A] hover:bg-[#F5F4F0] transition-colors">
                Editar
              </button>
              <button className="px-4 py-2 text-sm rounded-lg bg-[#2A6B5C] text-white font-medium hover:bg-[#1A4A3E] transition-colors">
                Ver proposta
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
