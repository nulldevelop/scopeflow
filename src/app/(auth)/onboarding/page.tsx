'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Rocket,
  Settings2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Users,
  Code2,
  Layout,
  Globe,
} from 'lucide-react'
import { organization, useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { completeOnboardingAction } from './_actions/complete-onboarding'

const profiles = [
  {
    id: 'freelancer',
    title: 'Freelancer',
    description: 'Trabalho de forma independente em projetos sob demanda.',
    icon: Code2,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'software_house',
    title: 'Software House',
    description: 'Empresa focada em desenvolvimento de software por contrato.',
    icon: Building2,
    color: 'bg-brand-light text-brand',
  },
  {
    id: 'agencia',
    title: 'Agência Digital',
    description: 'Prestação de diversos serviços digitais e desenvolvimento.',
    icon: Layout,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'saas_startup',
    title: 'SaaS / Startup',
    description: 'Construindo e escalando meu próprio produto digital.',
    icon: Rocket,
    color: 'bg-purple-50 text-purple-600',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, isPending: sessionPending } = useSession()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form states
  const [orgName, setOrgName] = useState('')
  const [slug, setSlug] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [details, setDetails] = useState({
    hourlyRate: '',
    teamSize: '',
    mainTech: '',
  })

  // Auto-generate slug
  useEffect(() => {
    if (orgName && !slug) {
      setSlug(orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''))
    }
  }, [orgName, slug])

  const nextStep = () => setStep((s) => s + 1)
  const prevStep = () => setStep((s) => s - 1)

  const handleComplete = async () => {
    setLoading(true)
    try {
      const { data, error } = await organization.create({
        name: orgName,
        slug: slug,
      })

      if (error) {
        console.error('Error creating organization:', error)
        alert('Erro ao criar organização. Tente outro slug.')
        setLoading(false)
        return
      }

      // Salva os dados extras e sincroniza
      await completeOnboardingAction({
        profile: selectedProfile!,
        details: {
          hourlyRate: details.hourlyRate,
          teamSize: details.teamSize,
          mainTech: details.mainTech,
        }
      })
      
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  if (sessionPending) return null

  const steps = [
    { id: 1, label: 'Identidade', icon: Building2 },
    { id: 2, label: 'Perfil', icon: Users },
    { id: 3, label: 'Personalização', icon: Settings2 },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Progress Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">Configurando seu Workspace</h2>
            <p className="text-sm text-gray-500">Estamos preparando sua experiência no ScopeFlow.</p>
          </div>
          
          <nav className="space-y-2">
            {steps.map((s) => (
              <div
                key={s.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  step === s.id
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : step > s.id 
                    ? 'text-brand bg-brand-light'
                    : 'text-gray-400'
                )}
              >
                {step > s.id ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <s.icon className="w-5 h-5" />
                )}
                <span>{s.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* Form Main Area */}
        <main className="lg:col-span-3">
          <Card className="p-8 sm:p-12 bg-white border border-gray-200 rounded-[24px] shadow-sm relative overflow-hidden min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 flex-1"
                >
                  <header>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Primeiro, como devemos chamar seu Workspace?</h3>
                    <p className="text-gray-500">Pode ser o nome da sua empresa ou sua marca pessoal.</p>
                  </header>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Nome da Organização</Label>
                      <Input
                        id="orgName"
                        placeholder="Ex: Scope Digital"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="h-12 rounded-xl text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL personalizada)</Label>
                      <div className="relative">
                        <Input
                          id="slug"
                          placeholder="scope-digital"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          className="h-12 rounded-xl text-lg pl-36"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                          scopeflow.com/
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 flex-1"
                >
                  <header>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Qual seu perfil de atuação?</h3>
                    <p className="text-gray-500">Isso nos ajuda a personalizar o cálculo de precificação e o catálogo.</p>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProfile(p.id)}
                        className={cn(
                          'p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-4',
                          selectedProfile === p.id
                            ? 'border-brand bg-brand-light/20 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        )}
                      >
                        <div className={cn('size-12 rounded-xl flex items-center justify-center', p.color)}>
                          <p.icon className="size-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{p.title}</p>
                          <p className="text-sm text-gray-500">{p.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 flex-1"
                >
                  <header>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Quase lá! Alguns detalhes finais.</h3>
                    <p className="text-gray-500">Personalize sua experiência para obter melhores resultados.</p>
                  </header>

                  <div className="space-y-6">
                    {selectedProfile === 'freelancer' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="hourlyRate">Qual o valor médio da sua hora? (R$)</Label>
                          <Input
                            id="hourlyRate"
                            type="number"
                            placeholder="Ex: 80"
                            value={details.hourlyRate}
                            onChange={(e) => setDetails({...details, hourlyRate: e.target.value})}
                            className="h-12 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mainTech">Principal tecnologia/stack</Label>
                          <Input
                            id="mainTech"
                            placeholder="Ex: React + Node.js"
                            value={details.mainTech}
                            onChange={(e) => setDetails({...details, mainTech: e.target.value})}
                            className="h-12 rounded-xl"
                          />
                        </div>
                      </>
                    )}

                    {selectedProfile === 'software_house' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="teamSize">Qual o tamanho da sua equipe?</Label>
                          <select 
                            className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm"
                            value={details.teamSize}
                            onChange={(e) => setDetails({...details, teamSize: e.target.value})}
                          >
                            <option value="">Selecione...</option>
                            <option value="1-5">1 a 5 pessoas</option>
                            <option value="6-20">6 a 20 pessoas</option>
                            <option value="21+">Mais de 20 pessoas</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mainTech">Principais serviços</Label>
                          <Input
                            id="mainTech"
                            placeholder="Ex: Web, Mobile, Cloud"
                            value={details.mainTech}
                            onChange={(e) => setDetails({...details, mainTech: e.target.value})}
                            className="h-12 rounded-xl"
                          />
                        </div>
                      </>
                    )}

                    {(!selectedProfile || (selectedProfile !== 'freelancer' && selectedProfile !== 'software_house')) && (
                      <div className="py-12 text-center text-gray-400 italic">
                        Não são necessários detalhes adicionais para este perfil.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Navigation */}
            <div className="mt-auto pt-8 flex items-center justify-between border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={step === 1 || loading}
                className={cn('gap-2', step === 1 && 'invisible')}
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Button>

              {step < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={step === 1 ? !orgName : !selectedProfile}
                  className="bg-brand hover:bg-brand-dark text-white rounded-xl h-11 px-8 gap-2"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-brand hover:bg-brand-dark text-white rounded-xl h-11 px-8 gap-2"
                >
                  {loading ? 'Finalizando...' : 'Finalizar Setup'} <CheckCircle2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
