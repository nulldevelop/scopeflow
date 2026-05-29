'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Crown,
  Database,
  Globe,
  HelpCircle,
  Layout,
  Rocket,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import type React from 'react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  levelMultiplier,
  SENIORITY_LABELS,
  type SeniorityLevel,
} from '@/lib/pricing'
import { cn } from '@/lib/utils'
import { completeOnboardingAction } from './_actions/complete-onboarding'
import {
  type OnboardingInput,
  onboardingSchema,
} from './_schemas/onboarding-schema'

const profiles = [
  {
    id: 'landing_page',
    title: 'Landing Page Dev',
    icon: Globe,
    description: 'Sites institucionais e páginas de campanha.',
    questions: [
      {
        id: 'taxRegime',
        label: 'Regime Tributário',
        type: 'select',
        options: ['MEI', 'Simples Nacional', 'Lucro Presumido'],
      },
      {
        id: 'taxPercentage',
        label: '% Imposto',
        type: 'number',
        placeholder: '6.0',
      },
      {
        id: 'workHoursDay',
        label: 'Horas/dia',
        type: 'number',
        placeholder: '4',
      },
      {
        id: 'desiredSalary',
        label: 'Pro-labore desejado (R$)',
        type: 'number',
        placeholder: '5000',
      },
      {
        id: 'fixedCosts',
        label: 'Custos fixos (R$)',
        type: 'number',
        placeholder: '500',
      },
    ],
  },
  {
    id: 'frontend',
    title: 'Front-end Especialista',
    icon: Layout,
    description: 'Dashboards, design systems e interfaces complexas.',
    questions: [
      {
        id: 'taxRegime',
        label: 'Regime Tributário',
        type: 'select',
        options: ['Simples Nacional', 'PF / Autônomo', 'Lucro Presumido'],
      },
      {
        id: 'taxPercentage',
        label: '% Imposto',
        type: 'number',
        placeholder: '10.0',
      },
      {
        id: 'workHoursDay',
        label: 'Horas/dia',
        type: 'number',
        placeholder: '6',
      },
      {
        id: 'desiredSalary',
        label: 'Salário desejado (R$)',
        type: 'number',
        placeholder: '8000',
      },
      {
        id: 'fixedCosts',
        label: 'Softwares/Setup (R$)',
        type: 'number',
        placeholder: '800',
      },
    ],
  },
  {
    id: 'backend',
    title: 'Back-end / API Dev',
    icon: Database,
    description: 'APIs, integrações e banco de dados.',
    questions: [
      {
        id: 'taxRegime',
        label: 'Regime Tributário',
        type: 'select',
        options: ['Simples Nacional', 'Lucro Presumido', 'Offshore'],
      },
      {
        id: 'taxPercentage',
        label: '% Imposto',
        type: 'number',
        placeholder: '12.0',
      },
      {
        id: 'workHoursDay',
        label: 'Horas/dia',
        type: 'number',
        placeholder: '6',
      },
      {
        id: 'desiredSalary',
        label: 'Salário desejado (R$)',
        type: 'number',
        placeholder: '10000',
      },
      {
        id: 'fixedCosts',
        label: 'Infra/Ferramentas (R$)',
        type: 'number',
        placeholder: '1200',
      },
    ],
  },
  {
    id: 'fullstack',
    title: 'Full Stack Solo',
    icon: Zap,
    description: 'Projetos completos do banco ao botão.',
    questions: [
      {
        id: 'taxRegime',
        label: 'Regime Tributário',
        type: 'select',
        options: ['MEI', 'Simples Nacional', 'Lucro Presumido'],
      },
      {
        id: 'taxPercentage',
        label: '% Imposto',
        type: 'number',
        placeholder: '6.0',
      },
      {
        id: 'workHoursDay',
        label: 'Horas/dia',
        type: 'number',
        placeholder: '5',
      },
      {
        id: 'desiredSalary',
        label: 'Salário desejado (R$)',
        type: 'number',
        placeholder: '9000',
      },
      {
        id: 'fixedCosts',
        label: 'Custos totais (R$)',
        type: 'number',
        placeholder: '1000',
      },
    ],
  },
  {
    id: 'saas_startup',
    title: 'Dev de SaaS',
    icon: Rocket,
    description: 'MVPs e produtos digitais escaláveis.',
    questions: [
      {
        id: 'productName',
        label: 'Nome do SaaS',
        type: 'text',
        placeholder: 'Minha Startup',
      },
      {
        id: 'workHoursDay',
        label: 'Horas dedicadas/dia',
        type: 'number',
        placeholder: '4',
      },
      {
        id: 'desiredSalary',
        label: 'Burn rate pessoal (R$)',
        type: 'number',
        placeholder: '6000',
      },
      {
        id: 'fixedCosts',
        label: 'Servidores/APIs (R$)',
        type: 'number',
        placeholder: '400',
      },
      {
        id: 'profitMargin',
        label: 'Margem alvo (%)',
        type: 'number',
        placeholder: '50',
      },
    ],
  },
] as const

const steps = [
  { id: 1, name: 'Identidade', description: 'Nome e URL' },
  { id: 2, name: 'Perfil', description: 'Como você trabalha' },
  { id: 3, name: 'Calibragem', description: 'Seu Valor Hora' },
  { id: 4, name: 'Plano', description: 'Escolha inicial' },
]

const helpTexts: Record<string, { title: string; description: string }> = {
  taxRegime: {
    title: 'Regime Tributário',
    description:
      'O regime define como você paga impostos. Se não souber, MEI é o padrão para quem começa sozinho.',
  },
  taxPercentage: {
    title: '% Imposto',
    description:
      'A porcentagem que sai direto de cada nota emitida. MEI costuma ser fixo (valor baixo), Simples Nacional começa em ~6%.',
  },
  workHoursDay: {
    title: 'Horas/dia',
    description:
      'Quantas horas você realmente senta para codar por dia (foco total). Recomendamos 4 a 6 horas úteis.',
  },
  desiredSalary: {
    title: 'Remuneração desejada',
    description:
      'Quanto você quer tirar de "salário" livre para você no final do mês.',
  },
  fixedCosts: {
    title: 'Custos fixos',
    description:
      'Soma de aluguel, internet, softwares, contador e tudo que você paga todo mês para trabalhar.',
  },
  workDaysMonth: {
    title: 'Dias trabalhados/mês',
    description: 'Média de dias úteis. Padrão é 22 (segunda a sexta).',
  },
  profitMargin: {
    title: 'Margem de Lucro Alvo',
    description:
      'Além do seu salário, quanto a sua empresa deve lucrar para reserva e reinvestimento.',
  },
}

function HelpTooltip({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full w-4 h-4 bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors ml-1"
        >
          <HelpCircle className="w-3 h-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-64">
        <PopoverHeader>
          <PopoverTitle className="text-sm font-bold">{title}</PopoverTitle>
          <PopoverDescription className="text-xs leading-relaxed">
            {description}
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromUrl = searchParams.get('plan')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      orgName: '',
      slug: '',
      profile: undefined,
      answers: {
        seniorityLevel: 'junior',
        taxRegime: 'Simples Nacional',
        taxPercentage: '6',
        workHoursDay: '6',
        workDaysMonth: '22',
        desiredSalary: '5000',
        fixedCosts: '1000',
        contingencyReserve: '10',
        profitMargin: '20',
      },
      plan: (planFromUrl as 'free' | 'pro' | 'equipe') || 'free',
    },
  })

  useEffect(() => {
    if (planFromUrl) {
      // @ts-expect-error - enum type mismatch
      setValue('plan', planFromUrl)
    }
  }, [planFromUrl, setValue])

  const formData = useWatch({ control })
  const activeProfile = profiles.find((p) => p.id === formData.profile)

  const calc = useMemo(() => {
    const desiredSalary = Number(formData.answers?.desiredSalary) || 0
    const fixedCosts = Number(formData.answers?.fixedCosts) || 0
    const taxPercentage = Number(formData.answers?.taxPercentage) || 0
    const profitMargin = Number(formData.answers?.profitMargin) || 0
    const workHoursDay = Number(formData.answers?.workHoursDay) || 0
    const workDaysMonth = Number(formData.answers?.workDaysMonth) || 22

    const baseCost = desiredSalary + fixedCosts
    const totalDeductionsPct = taxPercentage + profitMargin
    const adjustmentFactor =
      totalDeductionsPct < 100 ? 1 - totalDeductionsPct / 100 : 0.01
    const adjustedMonthlyGoal =
      adjustmentFactor > 0 ? baseCost / adjustmentFactor : 0
    const hoursPerMonth = workHoursDay * workDaysMonth
    const baseHourlyRate =
      hoursPerMonth > 0 ? adjustedMonthlyGoal / hoursPerMonth : 0

    const seniorityMultiplier = levelMultiplier(
      formData.answers?.seniorityLevel,
    )
    const hourlyRate = Math.ceil(baseHourlyRate * seniorityMultiplier)

    return {
      desiredSalary,
      fixedCosts,
      baseCost,
      taxPercentage,
      profitMargin,
      totalDeductionsPct,
      adjustmentFactor,
      adjustedMonthlyGoal,
      workHoursDay,
      workDaysMonth,
      hoursPerMonth,
      baseHourlyRate,
      seniorityMultiplier,
      hourlyRate,
    }
  }, [formData.answers])

  const nextStep = async () => {
    let fieldsToValidate: (keyof OnboardingInput)[] = []
    if (step === 1) fieldsToValidate = ['orgName', 'slug']
    if (step === 2) fieldsToValidate = ['profile']

    const isValid = await trigger(fieldsToValidate)
    if (isValid) setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setValue('orgName', name)

    // Generate slug automatically
    const generatedSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

    setValue('slug', generatedSlug, { shouldValidate: true })
  }

  const onSubmit = async (data: OnboardingInput) => {
    setLoading(true)
    try {
      const res = await completeOnboardingAction(data)
      if (res.success) {
        toast.success('Configuração finalizada com sucesso!')
        if (res.data?.checkoutUrl) {
          window.location.href = res.data.checkoutUrl
        } else {
          router.push('/dashboard')
        }
      } else {
        toast.error(res.error || 'Erro ao finalizar configuração.')
      }
    } catch (_error) {
      toast.error('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col items-center py-12 md:py-20 p-6">
      <div className="max-w-4xl w-full">
        {/* Step Indicator */}
        <div className="mb-20 flex items-center justify-between px-2 relative">
          {/* Background Line */}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10" />

          {steps.map((s) => (
            <div
              key={s.id}
              className="flex flex-col items-center gap-3 relative"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 bg-white',
                  step >= s.id
                    ? 'border-brand text-brand shadow-lg shadow-brand/10 scale-110 font-bold'
                    : 'border-gray-200 text-gray-400',
                )}
              >
                {step > s.id ? (
                  <div className="bg-brand w-full h-full rounded-full flex items-center justify-center text-white">
                    <Check className="w-5 h-5" />
                  </div>
                ) : (
                  <span>{s.id}</span>
                )}
              </div>
              <div className="absolute top-12 whitespace-nowrap text-center">
                <p
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-500',
                    step >= s.id ? 'text-brand' : 'text-gray-400',
                  )}
                >
                  {s.name}
                </p>
                <p className="text-[9px] text-gray-400 font-medium hidden md:block">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-8 md:p-12 rounded-[32px] shadow-xl border border-gray-100"
              >
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/5 text-brand rounded-full mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Passo 01: Identidade
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Primeiro, como se chama seu negócio?
                  </h1>
                  <p className="text-gray-500">
                    Isso será usado nas suas propostas e na sua URL exclusiva.
                  </p>
                </div>

                <div className="space-y-6">
                  <Field>
                    <FieldLabel>Nome da Organização</FieldLabel>
                    <Input
                      {...register('orgName')}
                      onChange={handleOrgNameChange}
                      placeholder="Ex: Minha Software House"
                      className="h-14 text-lg rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all"
                    />
                    {errors.orgName && (
                      <FieldError>{errors.orgName.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel>URL Exclusiva</FieldLabel>
                    <div className="flex items-center h-14 w-full rounded-2xl border border-gray-100 bg-gray-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/20 transition-all overflow-hidden px-4 gap-0">
                      <span className="text-gray-400 font-mono text-sm whitespace-nowrap select-none pr-1">
                        scopeflow.com.br/
                      </span>
                      <input
                        {...register('slug')}
                        placeholder="meu-negocio"
                        className="flex-1 h-full bg-transparent border-none outline-none text-lg font-mono text-gray-900 placeholder:text-gray-300 min-w-0 p-0"
                        onChange={(e) => {
                          const val = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, '')
                          setValue('slug', val)
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">
                      Dica: Use apenas letras minúsculas, números e hífens.
                    </p>
                    {errors.slug && (
                      <FieldError>{errors.slug.message}</FieldError>
                    )}
                  </Field>
                </div>

                <div className="mt-10 flex justify-end">
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-brand text-white hover:bg-brand-dark h-14 px-8 rounded-2xl gap-2 text-lg shadow-lg shadow-brand/20"
                  >
                    Continuar <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-8 md:p-12 rounded-[32px] shadow-xl border border-gray-100"
              >
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/5 text-brand rounded-full mb-4">
                    <Star className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Passo 02: Perfil
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Qual seu perfil de trabalho?
                  </h1>
                  <p className="text-gray-500">
                    Isso nos ajuda a pré-configurar seu catálogo de horas e
                    complexidade.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profiles.map((p) => {
                    const Icon = p.icon
                    const isSelected = formData.profile === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setValue('profile', p.id)
                          // Reset answers to default for this profile to avoid calculation ghosting
                          setValue('answers', {
                            seniorityLevel:
                              formData.answers?.seniorityLevel || 'junior',
                            taxRegime: 'Simples Nacional',
                            taxPercentage: '6',
                            workHoursDay: '6',
                            workDaysMonth: '22',
                            desiredSalary: '5000',
                            fixedCosts: '1000',
                            contingencyReserve: '10',
                            profitMargin: '20',
                          })
                        }}
                        className={cn(
                          'flex items-start gap-4 p-5 rounded-3xl border-2 transition-all text-left group',
                          isSelected
                            ? 'bg-white border-brand shadow-lg ring-1 ring-brand/10'
                            : 'bg-gray-50/50 border-transparent hover:border-gray-200',
                        )}
                      >
                        <div
                          className={cn(
                            'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors',
                            isSelected
                              ? 'bg-brand text-white'
                              : 'bg-white text-gray-400 group-hover:text-brand',
                          )}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p
                            className={cn(
                              'font-bold transition-colors',
                              isSelected
                                ? 'text-gray-900'
                                : 'text-gray-600 group-hover:text-gray-900',
                            )}
                          >
                            {p.title}
                          </p>
                          <p className="text-xs text-gray-400 leading-relaxed mt-1">
                            {p.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
                {errors.profile && (
                  <p className="text-red-500 text-xs mt-4">
                    {errors.profile.message}
                  </p>
                )}

                <div className="mt-10 flex justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    className="h-14 px-8 rounded-2xl"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.profile}
                    className="bg-brand text-white hover:bg-brand-dark h-14 px-8 rounded-2xl gap-2 text-lg shadow-lg shadow-brand/20"
                  >
                    Configurar Metas <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && activeProfile && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-6 md:p-8 rounded-[32px] shadow-xl border border-gray-100"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="mb-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/5 text-brand rounded-full mb-3">
                        <Crown className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Passo 03: Calibragem
                        </span>
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Vamos calcular seu valor hora
                      </h1>
                      <p className="text-sm text-gray-500 mt-1">
                        Responda as perguntas abaixo para calibrarmos sua
                        lucratividade.
                      </p>
                    </div>

                    <div className="mb-6">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Seu nível de senioridade
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          ['junior', 'pleno', 'senior'] as SeniorityLevel[]
                        ).map((lvl) => {
                          const active =
                            (formData.answers?.seniorityLevel || 'junior') ===
                            lvl
                          const pct = Math.round(
                            (levelMultiplier(lvl) - 1) * 100,
                          )
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() =>
                                setValue('answers.seniorityLevel', lvl)
                              }
                              className={cn(
                                'flex flex-col items-center justify-center rounded-2xl border-2 px-3 py-3 transition-all',
                                active
                                  ? 'border-brand bg-brand/5 text-gray-900'
                                  : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200',
                              )}
                            >
                              <span className="text-sm font-bold">
                                {SENIORITY_LABELS[lvl]}
                              </span>
                              <span
                                className={cn(
                                  'text-[10px] font-mono mt-0.5',
                                  active ? 'text-brand' : 'text-gray-400',
                                )}
                              >
                                {pct === 0 ? 'base' : `+${pct}%`}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                        Prêmio aplicado sobre o seu valor/hora de custo. Não
                        altera as horas dos orçamentos.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeProfile.questions.map((q) => (
                        <Field key={q.id}>
                          <FieldLabel className="flex items-center gap-1">
                            {q.label}
                            {helpTexts[q.id] && (
                              <HelpTooltip
                                title={helpTexts[q.id].title}
                                description={helpTexts[q.id].description}
                              />
                            )}
                          </FieldLabel>
                          <FieldContent>
                            {q.type === 'select' ? (
                              <Controller
                                control={control}
                                name={`answers.${q.id}`}
                                render={({ field }) => (
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger className="h-10 rounded-xl bg-gray-50/50 border-gray-100">
                                      <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {q.options?.map((opt) => (
                                        <SelectItem key={opt} value={opt}>
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            ) : (
                              <Input
                                type={q.type}
                                {...register(`answers.${q.id}`)}
                                placeholder={q.placeholder}
                                className="h-10 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white py-2"
                              />
                            )}
                          </FieldContent>
                        </Field>
                      ))}
                      <Field>
                        <FieldLabel className="flex items-center gap-1">
                          Dias trabalhados por mês
                          <HelpTooltip
                            title={helpTexts.workDaysMonth.title}
                            description={helpTexts.workDaysMonth.description}
                          />
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            {...register('answers.workDaysMonth')}
                            placeholder="22"
                            className="h-10 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white py-2"
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel className="flex items-center gap-1">
                          Margem de Lucro (%)
                          <HelpTooltip
                            title={helpTexts.profitMargin.title}
                            description={helpTexts.profitMargin.description}
                          />
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            {...register('answers.profitMargin')}
                            className="h-10 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white py-2"
                          />
                        </FieldContent>
                      </Field>
                    </div>
                  </div>

                  <div className="w-full lg:w-80 shrink-0">
                    <div className="lg:sticky lg:top-8 p-5 bg-brand/[0.04] rounded-[20px] border border-brand/10">
                      <div className="text-center mb-4">
                        <p className="text-[10px] font-bold text-brand uppercase tracking-[0.2em] mb-1">
                          Seu Valor Hora
                        </p>
                        <h2 className="text-4xl font-black text-gray-900 font-mono tracking-tighter">
                          R$ {calc.hourlyRate}
                        </h2>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-brand/10">
                        <div className="rounded-xl bg-white/60 px-3 py-2 border border-brand/5">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Custo Base
                            </span>
                            <span className="text-xs font-bold text-gray-900 font-mono">
                              R$ {calc.baseCost}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono">
                            R$ {calc.desiredSalary} + R$ {calc.fixedCosts}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/60 px-3 py-2 border border-brand/5">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Ajuste ({calc.totalDeductionsPct}%)
                            </span>
                            <span className="text-xs font-bold text-gray-900 font-mono">
                              R$ {Math.round(calc.adjustedMonthlyGoal)}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono">
                            R$ {calc.baseCost} &divide;{' '}
                            {calc.adjustmentFactor.toFixed(2)}
                          </p>
                          <div className="flex gap-3 mt-1 text-[10px] text-gray-400 font-mono">
                            <span>Imposto: {calc.taxPercentage}%</span>
                            <span>Margem: {calc.profitMargin}%</span>
                          </div>
                        </div>

                        <div className="rounded-xl bg-white/60 px-3 py-2 border border-brand/5">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Horas Vendáveis
                            </span>
                            <span className="text-xs font-bold text-gray-900 font-mono">
                              {calc.hoursPerMonth}h
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {calc.workHoursDay}h/dia &times;{' '}
                            {calc.workDaysMonth} dias
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/60 px-3 py-2 border border-brand/5">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Senioridade
                            </span>
                            <span className="text-xs font-bold text-gray-900 font-mono">
                              {calc.seniorityMultiplier.toFixed(1)}×
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {
                              SENIORITY_LABELS[
                                (formData.answers?.seniorityLevel ||
                                  'junior') as SeniorityLevel
                              ]
                            }{' '}
                            · piso R$ {Math.ceil(calc.baseHourlyRate)}/h
                          </p>
                        </div>

                        <div className="rounded-lg bg-brand/10 px-3 py-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-semibold text-brand uppercase tracking-wider">
                              Fórmula Final
                            </span>
                            <span className="text-xs font-bold text-gray-900 font-mono">
                              R$ {calc.hourlyRate}/h
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                            R$ {Math.ceil(calc.baseHourlyRate)} &times;{' '}
                            {calc.seniorityMultiplier.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    className="h-12 px-6 rounded-2xl"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-brand text-white hover:bg-brand-dark h-12 px-6 rounded-2xl gap-2 shadow-lg shadow-brand/20"
                  >
                    Último Passo <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-8 md:p-12 rounded-[32px] shadow-xl border border-gray-100"
              >
                <div className="mb-10 text-center max-w-2xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/5 text-brand rounded-full mb-4">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Passo 04: Escolha o Plano
                    </span>
                  </div>
                  <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                    Comece como quiser.
                  </h1>
                  <p className="text-gray-500">
                    Acesse o ScopeFlow hoje mesmo com os limites que você
                    precisa.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {[
                    {
                      id: 'free',
                      name: 'Grátis',
                      price: 'R$ 0',
                      description: 'Para quem está começando a organizar.',
                      features: [
                        'Até 5 orçamentos/mês',
                        'Proposta via Link',
                        'Catálogo Básico',
                      ],
                    },
                    {
                      id: 'pro',
                      name: 'Pro',
                      price: 'R$ 49',
                      description: 'Foco total em vendas profissionais.',
                      features: [
                        'Orçamentos Ilimitados',
                        'PDF Customizado',
                        'Suporte Prioritário',
                      ],
                      popular: true,
                    },
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        // @ts-expect-error - enum type mismatch
                        setValue('plan', plan.id)
                      }}
                      className={cn(
                        'relative flex flex-col p-6 rounded-[32px] border-2 transition-all text-left',
                        formData.plan === plan.id
                          ? 'bg-white border-brand shadow-2xl ring-1 ring-brand/10 scale-[1.02]'
                          : 'bg-gray-50/50 border-transparent hover:border-gray-200',
                      )}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                          Mais Popular
                        </div>
                      )}
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                          {plan.name}
                        </h3>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-2xl font-black text-gray-900 font-mono">
                            {plan.price}
                          </span>
                          <span className="text-gray-400 text-xs">/mês</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 min-h-[30px]">
                          {plan.description}
                        </p>
                      </div>
                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-center gap-2 text-[11px] text-gray-600"
                          >
                            <Check className="w-3.5 h-3.5 text-brand" /> {f}
                          </li>
                        ))}
                      </ul>
                      <div
                        className={cn(
                          'w-full h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all',
                          formData.plan === plan.id
                            ? 'bg-brand text-white'
                            : 'bg-white border border-gray-200 text-gray-400',
                        )}
                      >
                        {formData.plan === plan.id
                          ? 'Plano Selecionado'
                          : 'Selecionar Plano'}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-12 flex justify-between items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    className="h-14 px-8 rounded-2xl"
                  >
                    Voltar
                  </Button>
                  <Button
                    disabled={loading}
                    type="submit"
                    className="bg-gray-900 text-white hover:bg-black h-14 px-12 rounded-2xl text-lg font-bold shadow-xl transition-all active:scale-95"
                  >
                    {loading ? 'Finalizando...' : 'Concluir e Acessar'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F3] flex items-center justify-center text-gray-400">
          Carregando configuração...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  )
}
