'use client'

import { motion } from 'framer-motion'
import { Calendar, Users, Clock, Layers, ChevronRight } from 'lucide-react'

export function QuoteExample() {
  return (
    <section className="py-32 px-6 bg-[#F8F7F3] relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1C1C1A] mb-6">
            Informações claras para todos
          </h2>
          <p className="text-[#5F5E5A] text-lg max-w-2xl mx-auto font-light">
            Transparência total. Gere links de propostas interativas onde você e seu cliente 
            visualizam exatamente o mesmo escopo, prazos e custos.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative group"
        >
          {/* Decorative Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#2A6B5C]/10 to-[#9BBFB8]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative bg-white border border-[#D3D1C7]/60 rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden">
            {/* Top Bar Decoration */}
            <div className="h-2 w-full bg-[#2A6B5C]" />
            
            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[#2A6B5C]/10 text-[#2A6B5C]">
                      PROPOSTA #2026-042
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1C1C1A]">
                    App de Gestão Financeira v2
                  </h3>
                  <p className="text-sm text-[#888780] flex items-center gap-2 mt-2">
                    <Users className="w-4 h-4" /> Empresa Nexus Digital · <Calendar className="w-4 h-4 ml-1" /> 12 Abr 2026
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-[#E6F1FB] text-[#0C447C] font-bold text-xs flex items-center gap-2 border border-[#0C447C]/10 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-[#0C447C]" />
                  AGUARDANDO APROVAÇÃO
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div className="p-4 rounded-2xl bg-[#F8F7F3] border border-[#D3D1C7]/30">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#888780] mb-2 flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Módulos
                  </p>
                  <p className="text-3xl font-bold text-[#1C1C1A]">06</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8F7F3] border border-[#D3D1C7]/30">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#888780] mb-2 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Esforço
                  </p>
                  <p className="text-3xl font-bold text-[#1C1C1A]">182h</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8F7F3] border border-[#D3D1C7]/30">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#888780] mb-2 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Prazo
                  </p>
                  <p className="text-3xl font-bold text-[#1C1C1A]">8 sem.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#2A6B5C]/5 border border-[#2A6B5C]/20">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#2A6B5C] mb-2">
                    Investimento
                  </p>
                  <p className="text-3xl font-bold text-[#2A6B5C]">R$ 18.2k</p>
                </div>
              </div>

              <div className="h-px bg-[#D3D1C7]/30 w-full mb-10" />

              {/* Footer */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                  <p className="text-xs font-bold text-[#888780] uppercase tracking-wider mb-2">Condições de Pagamento</p>
                  <p className="text-base text-[#1C1C1A] font-medium">
                    Entrada: <span className="font-bold">R$ 5.000</span> <span className="text-[#888780] mx-2">+</span> 3× de <span className="font-bold">R$ 4.400</span>
                  </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button className="flex-1 md:flex-none px-8 py-4 text-sm font-bold rounded-2xl border border-[#D3D1C7] text-[#5F5E5A] hover:bg-[#F5F4F0] transition-all active:scale-95">
                    Revisar Escopo
                  </button>
                  <button className="flex-1 md:flex-none px-8 py-4 text-sm font-bold rounded-2xl bg-[#2A6B5C] text-white hover:bg-[#1f5045] shadow-lg shadow-[#2A6B5C]/20 transition-all flex items-center justify-center gap-2 group active:scale-95">
                    Aprovar Proposta
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Interaction Element */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="hidden lg:block absolute -right-12 top-1/2 -translate-y-1/2 bg-white p-4 rounded-2xl shadow-xl border border-[#D3D1C7]/50 max-w-[180px]"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-[#2A6B5C]">
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold leading-tight">Atualizado agora mesmo</p>
            </div>
            <div className="space-y-1.5">
              <div className="h-1.5 w-full bg-[#F5F4F0] rounded-full" />
              <div className="h-1.5 w-[80%] bg-[#F5F4F0] rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

