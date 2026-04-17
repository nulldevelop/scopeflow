import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0E2E26] px-6 py-24 md:py-32 lg:py-40">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute bottom-0 left-0 w-[60%] h-[50%] bg-[#2A6B5C] blur-[120px]" />
        <div className="absolute top-0 right-0 w-[40%] h-[60%] bg-[#1A4A3E] blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 text-[10px] font-medium tracking-widest uppercase rounded-full border border-[#2A6B5C]/40 bg-[#2A6B5C]/10 text-[#9BBFB8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2A6B5C]" />
          SaaS de Precificação
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6 leading-tight">
          Orçamentos profissionais,
          <br />
          <span className="text-[#9BBFB8]">em minutos.</span>
        </h1>

        <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
          Monte propostas a partir de funcionalidades reutilizáveis. O sistema
          calcula horas, custos e prazo automaticamente — sem planilhas.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button className="bg-[#2A6B5C] hover:bg-[#1A4A3E] text-white px-8 py-3 text-sm font-medium">
            Criar orçamento grátis
          </Button>
          <Button
            variant="outline"
            className="border-[#9BBFB8]/40 text-[#9BBFB8] hover:bg-[#9BBFB8]/10 px-8 py-3 text-sm font-medium"
          >
            Ver demonstração
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-white/10">
          <div className="text-center">
            <div className="text-2xl font-semibold text-white">50%</div>
            <div className="text-xs text-white/50 mt-1">
              menos tempo em orçamentos
            </div>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <div className="text-2xl font-semibold text-white">+20%</div>
            <div className="text-xs text-white/50 mt-1">
              na taxa de conversão
            </div>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <div className="text-2xl font-semibold text-white">100%</div>
            <div className="text-xs text-white/50 mt-1">personalizável</div>
          </div>
        </div>
      </div>
    </section>
  )
}
