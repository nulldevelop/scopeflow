'use client'

import React, { useEffect, useState } from 'react'
import { DevProfile } from '@/types'
import { useDevProfile } from '@/hooks/useDevProfile'
import { Card } from '@/components/ui/card'
import { 
  Globe, 
  Layout, 
  Database, 
  Zap, 
  Users, 
  Rocket, 
  Check 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const profiles: { id: DevProfile; name: string; description: string; icon: any }[] = [
  {
    id: 'landing_page',
    name: 'Landing Page Dev',
    description: 'Sites institucionais e páginas de campanha.',
    icon: Globe,
  },
  {
    id: 'frontend',
    name: 'Front-end Especialista',
    description: 'Dashboards, design systems e interfaces complexas.',
    icon: Layout,
  },
  {
    id: 'backend',
    name: 'Back-end / API Dev',
    description: 'APIs, integrações e banco de dados.',
    icon: Database,
  },
  {
    id: 'fullstack',
    name: 'Full Stack Solo',
    description: 'Projetos completos do banco ao botão.',
    icon: Zap,
  },
  {
    id: 'software_house',
    name: 'Software House',
    description: 'Equipes gerenciando múltiplos devs e projetos robustos.',
    icon: Users,
  },
  {
    id: 'saas',
    name: 'Dev de SaaS',
    description: 'MVPs e produtos digitais escaláveis.',
    icon: Rocket,
  },
]

export function ProfileSelector() {
  const { profile, setProfile } = useDevProfile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Evita erro de hidratação renderizando apenas no cliente
  if (!mounted || profile) return null

  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
            Qual é o seu perfil de desenvolvedor?
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Isso nos ajuda a calibrar as estimativas de horas e recomendar os módulos certos para você.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <Card
              key={p.id}
              onClick={() => setProfile(p.id)}
              className="p-6 cursor-pointer border-2 border-gray-100 hover:border-brand hover:shadow-xl hover:shadow-brand/5 transition-all group relative overflow-hidden bg-white"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-light group-hover:text-brand transition-colors mb-4">
                <p.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-brand transition-colors">
                {p.name}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {p.description}
              </p>
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
