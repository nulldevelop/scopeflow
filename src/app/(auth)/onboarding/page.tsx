'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Crown,
  Layout, Plus,
  Rocket,
  Sparkles,
  Star, Zap
} from 'lucide-react'
import { useRouter as useNavigation } from 'next/navigation'
import { useState } from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/kibo-ui/combobox'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { organization, useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { completeOnboardingAction } from './_actions/complete-onboarding'

const techOptions = [
  'React',
  'Next.js',
  'Vue.js',
  'Angular',
  'Node.js',
  'Python',
  'Java',
  'C#',
  'Go',
  'Rust',
  'PHP',
  'Laravel',
  'Django',
  'Spring Boot',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Firebase',
  'AWS',
  'Azure',
  'Google Cloud',
  'Docker',
  'Kubernetes',
  'Figma',
]

const steps = [
  { id: 1, title: 'Identidade' },
  { id: 2, title: 'Perfil' },
  { id: 3, title: 'Configuração' },
  { id: 4, title: 'Plano' },
]

const plans = [
  {
    id: 'free',
    title: 'Free',
    price: 'R$ 0',
    period: '/mês',
    description: 'Para começar',
    icon: Star,
    color: 'bg-gray-100',
    textColor: 'text-gray-600',
  },
  {
    id: 'basic',
    title: 'Basic',
    price: 'R$ 97',
    period: '/mês',
    description: 'Para freelancers',
    icon: Zap,
    color: 'bg-blue-50',
    textColor: 'text-blue-600',
    popular: true,
  },
  {
    id: 'pro',
    title: 'Pro',
    price: 'R$ 197',
    period: '/mês',
    description: 'Para empresas',
    icon: Crown,
    color: 'bg-brand-light',
    textColor: 'text-brand',
  },
]

const profiles = [
  {
    id: 'freelancer',
    title: 'Freelancer',
    description: 'Trabalho independente.',
    icon: Code2,
    questions: [
      { id: 'hourlyRate', label: 'Valor da hora (R$)', placeholder: '150' },
      { id: 'techStack', label: 'Stack tecnológica', isTags: true },
      {
        id: 'workModel',
        label: 'Modelo',
        options: ['Remoto', 'Presencial', 'Híbrido'],
      },
    ],
  },
  {
    id: 'software_house',
    title: 'Software House',
    description: 'Empresa de desenvolvimento.',
    icon: Building2,
    questions: [
      { id: 'hourlyRate', label: 'Valor hora (R$)', placeholder: '200' },
      {
        id: 'teamSize',
        label: 'Equipe',
        options: ['1-5', '6-15', '15-30', '30+'],
      },
      {
        id: 'segment',
        label: 'Segmento',
        options: ['E-commerce', 'Fintech', 'SaaS', 'Enterprise'],
      },
      { id: 'invites', label: 'Membros', allowInvites: true },
    ],
  },
  {
    id: 'agencia',
    title: 'Agência Digital',
    description: 'Serviços digitais.',
    icon: Layout,
    questions: [
      { id: 'hourlyRate', label: 'Valor hora (R$)', placeholder: '180' },
      { id: 'teamSize', label: 'Equipe', options: ['1-5', '6-15', '15+'] },
      {
        id: 'services',
        label: 'Serviços',
        options: ['Web', 'Mobile', 'UI/UX', 'Marketing'],
      },
      { id: 'invites', label: 'Membros', allowInvites: true },
    ],
  },
  {
    id: 'saas_startup',
    title: 'SaaS / Startup',
    description: 'Meu produto.',
    icon: Rocket,
    questions: [
      { id: 'productName', label: 'Nome do produto', placeholder: 'Meu SaaS' },
      {
        id: 'stage',
        label: 'Estágio',
        options: ['Ideação', 'MVP', 'Mercado', 'Escala'],
      },
      {
        id: 'teamSize',
        label: 'Time',
        options: ['Eu só', '2-5', '5-10', '10+'],
      },
      { id: 'invites', label: 'Membros', allowInvites: true },
    ],
  },
]

export default function OnboardingModal() {
  const router = useNavigation()
  const { data: session, isPending: sessionPending } = useSession()
  const [open, setOpen] = useState(true)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [orgName, setOrgName] = useState('')
  const [slug, setSlug] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [invites, setInvites] = useState<string[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string | null>('basic')

  const currentProfile = profiles.find((p) => p.id === selectedProfile)

  const nextStep = () => setStep((s) => s + 1)
  const prevStep = () => setStep((s) => s - 1)

  const handleComplete = async () => {
    if (!orgName || !slug || !selectedProfile) return
    setLoading(true)
    try {
      const { data, error } = await organization.create({ name: orgName, slug })
      if (error) {
        alert('Erro ao criar organização. Tente outro slug.')
        setLoading(false)
        return
      }
      await completeOnboardingAction({
        profile: selectedProfile,
        details: { ...answers, plan: selectedPlan },
      })
      setOpen(false)
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Erro ao criar organização.')
    } finally {
      setLoading(false)
    }
  }

  if (sessionPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen || (step === 4 && orgName && slug && selectedProfile)) {
          setOpen(isOpen)
        }
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl">
            Configurando seu Workspace
          </DialogTitle>
          <DialogDescription>
            Vamos configurar sua experiência no ScopeFlow
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 py-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium',
                  step >= s.id
                    ? 'bg-brand text-white'
                    : 'bg-gray-100 text-gray-400',
                )}
              >
                {step > s.id ? <Check className="w-3 h-3" /> : s.id}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'w-6 h-0.5 mx-1',
                    step > s.id ? 'bg-brand' : 'bg-gray-100',
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Nome da Organização</Label>
                <Input
                  placeholder="Ex: Scope Digital"
                  value={orgName}
                  onChange={(e) => {
                    setOrgName(e.target.value)
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, ''),
                    )
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm shrink-0">
                    scopeflow.com/
                  </span>
                  <Input
                    placeholder="sua-empresa"
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      )
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" disabled className="opacity-50">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  onClick={nextStep}
                  disabled={!orgName || !slug}
                >
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Label>Como você trabalha?</Label>
              <div className="grid grid-cols-2 gap-2">
                {profiles.map((profile) => {
                  const Icon = profile.icon
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => {
                        setSelectedProfile(profile.id)
                        setAnswers({})
                      }}
                      className={cn(
                        'p-3 rounded-lg border-2 text-left transition-all',
                        selectedProfile === profile.id
                          ? 'border-brand bg-brand/5'
                          : 'border-gray-100',
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4 mb-1.5',
                          selectedProfile === profile.id
                            ? 'text-brand'
                            : 'text-gray-400',
                        )}
                      />
                      <div className="font-medium text-sm">{profile.title}</div>
                      <div className="text-xs text-gray-400">
                        {profile.description}
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  onClick={nextStep}
                  disabled={!selectedProfile}
                >
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && currentProfile && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {currentProfile.questions.map((question) => (
                <div key={question.id} className="space-y-2">
                  {question.isTags ? (
                    <div className="space-y-2">
                      <Label>{question.label}</Label>
                      <div className="flex flex-wrap gap-1">
                        {techOptions.map((tech) => {
                          const isSelected = (answers[question.id] || '')
                            .split(',')
                            .includes(tech)
                          return (
                            <button
                              key={tech}
                              type="button"
                              onClick={() => {
                                const current = (answers[question.id] || '')
                                  .split(',')
                                  .filter(Boolean)
                                setAnswers({
                                  ...answers,
                                  [question.id]: isSelected
                                    ? current
                                        .filter((t) => t !== tech)
                                        .join(',')
                                    : [...current, tech].join(','),
                                })
                              }}
                              className={cn(
                                'px-2 py-1 text-xs rounded-full border',
                                isSelected
                                  ? 'bg-brand text-white border-brand'
                                  : 'bg-white text-gray-600 border-gray-200',
                              )}
                            >
                              {tech}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : question.allowInvites ? (
                    <div className="space-y-2">
                      <Label>Convidar membros</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="email@exemplo.com"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const v = (e.target as HTMLInputElement).value
                              if (v.includes('@')) {
                                setInvites([...invites, v])
                                ;(e.target as HTMLInputElement).value = ''
                              }
                            }
                          }}
                        />
                        <Button type="button" variant="outline" size="icon">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {invites.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {invites.map((e) => (
                            <span
                              key={e}
                              className="bg-gray-100 text-xs px-2 py-1 rounded-full"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : question.options ? (
                    <div className="space-y-2">
                      <Label>{question.label}</Label>
                      <Combobox
                        data={question.options.map((o) => ({
                          label: o,
                          value: o,
                        }))}
                        type="item"
                        value={answers[question.id] || ''}
                        onValueChange={(v) =>
                          setAnswers({ ...answers, [question.id]: v })
                        }
                      >
                        <ComboboxTrigger className="w-full justify-between bg-white">
                          <span className="text-muted-foreground">
                            {answers[question.id] || 'Selecione...'}
                          </span>
                        </ComboboxTrigger>
                        <ComboboxContent>
                          <ComboboxInput placeholder="Buscar..." />
                          <ComboboxList>
                            <ComboboxEmpty>Nenhum resultado</ComboboxEmpty>
                            {question.options.map((o) => (
                              <ComboboxItem key={o} value={o}>
                                {o}
                              </ComboboxItem>
                            ))}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>{question.label}</Label>
                      <Input
                        id={question.id}
                        type={question.id.includes('Rate') ? 'number' : 'text'}
                        placeholder={question.placeholder}
                        value={answers[question.id] || ''}
                        onChange={(e) =>
                          setAnswers({
                            ...answers,
                            [question.id]: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <Button className="flex-1" onClick={nextStep}>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Label>Escolha seu plano</Label>
              <div className="grid grid-cols-3 gap-2">
                {plans.map((plan) => {
                  const Icon = plan.icon
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={cn(
                        'p-3 rounded-lg border-2 text-left relative',
                        selectedPlan === plan.id
                          ? 'border-brand bg-brand/5'
                          : 'border-gray-100',
                        plan.popular && 'border-brand',
                      )}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-brand text-white text-xs px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                      <Icon className={cn('w-4 h-4 mb-1.5', plan.textColor)} />
                      <div className="font-semibold text-sm">{plan.title}</div>
                      <div className="text-xs text-gray-400">
                        {plan.description}
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Finalizar'}
                  <Check className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
