'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Crown,
  Layout,
  Rocket,
  Sparkles,
  Star,
  Zap,
  ArrowRight,
  Globe,
  Database,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { organization, useSession } from '@/lib/auth-client'
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
      { id: 'taxRegime', label: 'Regime Tributário', type: 'select', options: ['MEI', 'Simples Nacional', 'Lucro Presumido'] },
      { id: 'taxPercentage', label: '% Imposto', type: 'number', placeholder: '6.0' },
      { id: 'workHoursDay', label: 'Horas/dia', type: 'number', placeholder: '4' },
      { id: 'desiredSalary', label: 'Pro-labore desejado (R$)', type: 'number', placeholder: '5000' },
      { id: 'fixedCosts', label: 'Custos fixos (R$)', type: 'number', placeholder: '500' },
    ],
  },
  {
    id: 'frontend',
    title: 'Front-end Especialista',
    icon: Layout,
    description: 'Dashboards, design systems e interfaces complexas.',
    questions: [
      { id: 'taxRegime', label: 'Regime Tributário', type: 'select', options: ['Simples Nacional', 'PF / Autônomo', 'Lucro Presumido'] },
      { id: 'taxPercentage', label: '% Imposto', type: 'number', placeholder: '10.0' },
      { id: 'workHoursDay', label: 'Horas/dia', type: 'number', placeholder: '6' },
      { id: 'desiredSalary', label: 'Salário desejado (R$)', type: 'number', placeholder: '8000' },
      { id: 'fixedCosts', label: 'Softwares/Setup (R$)', type: 'number', placeholder: '800' },
    ],
  },
  {
    id: 'backend',
    title: 'Back-end / API Dev',
    icon: Database,
    description: 'APIs, integrações e banco de dados.',
    questions: [
      { id: 'taxRegime', label: 'Regime Tributário', type: 'select', options: ['Simples Nacional', 'Lucro Presumido', 'Offshore'] },
      { id: 'taxPercentage', label: '% Imposto', type: 'number', placeholder: '12.0' },
      { id: 'workHoursDay', label: 'Horas/dia', type: 'number', placeholder: '6' },
      { id: 'desiredSalary', label: 'Salário desejado (R$)', type: 'number', placeholder: '10000' },
      { id: 'fixedCosts', label: 'Infra/Ferramentas (R$)', type: 'number', placeholder: '1200' },
    ],
  },
  {
    id: 'fullstack',
    title: 'Full Stack Solo',
    icon: Zap,
    description: 'Projetos completos do banco ao botão.',
    questions: [
      { id: 'taxRegime', label: 'Regime Tributário', type: 'select', options: ['MEI', 'Simples Nacional', 'Lucro Presumido'] },
      { id: 'taxPercentage', label: '% Imposto', type: 'number', placeholder: '6.0' },
      { id: 'workHoursDay', label: 'Horas/dia', type: 'number', placeholder: '5' },
      { id: 'desiredSalary', label: 'Salário desejado (R$)', type: 'number', placeholder: '9000' },
      { id: 'fixedCosts', label: 'Custos totais (R$)', type: 'number', placeholder: '1000' },
    ],
  },
  {
    id: 'software_house',
    title: 'Software House',
    icon: Users,
    description: 'Equipes gerenciando múltiplos devs e projetos.',
    questions: [
      { id: 'taxRegime', label: 'Regime Tributário', type: 'select', options: ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'] },
      { id: 'taxPercentage', label: '% Imposto', type: 'number', placeholder: '15.0' },
      { id: 'workHoursDay', label: 'Horas produtivas/dia', type: 'number', placeholder: '6' },
      { id: 'desiredSalary', label: 'Pró-labore Sócios (R$)', type: 'number', placeholder: '15000' },
      { id: 'fixedCosts', label: 'Folha + Aluguel + Extras (R$)', type: 'number', placeholder: '5000' },
    ],
  },
  {
    id: 'saas_startup',
    title: 'Dev de SaaS',
    icon: Rocket,
    description: 'MVPs e produtos digitais escaláveis.',
    questions: [
      { id: 'productName', label: 'Nome do SaaS', type: 'text', placeholder: 'Minha Startup' },
      { id: 'workHoursDay', label: 'Horas dedicadas/dia', type: 'number', placeholder: '4' },
      { id: 'desiredSalary', label: 'Burn rate pessoal (R$)', type: 'number', placeholder: '6000' },
      { id: 'fixedCosts', label: 'Servidores/APIs (R$)', type: 'number', placeholder: '400' },
      { id: 'profitMargin', label: 'Margem alvo (%)', type: 'number', placeholder: '50' },
    ],
  },
]

const steps = [
  { id: 1, name: 'Identidade', description: 'Nome e URL' },
  { id: 2, name: 'Perfil', description: 'Como você trabalha' },
  { id: 3, name: 'Calibragem', description: 'Seu Valor Hora' },
  { id: 4, name: 'Plano', description: 'Escolha inicial' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      orgName: '',
      slug: '',
      profile: undefined as any,
      answers: {
        taxRegime: 'Simples Nacional',
        taxPercentage: '6',
        workHoursDay: '6',
        workDaysMonth: '22',
        desiredSalary: '5000',
        fixedCosts: '1000',
        contingencyReserve: '10',
        profitMargin: '20',
      },
      plan: 'basic',
      invites: [],
    } as OnboardingInput,
  })

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    setError,
    formState: { errors },
  } = form

  const profile = useWatch({ control, name: 'profile' })
  const answers = useWatch({ control, name: 'answers' })
  const planValue = useWatch({ control, name: 'plan' })

  const currentProfile = profiles.find((p) => p.id === profile)

  // Lógica da Calculadora de Valor Hora
  const calculatedStats = useMemo(() => {
    const salary = Number(answers?.desiredSalary || 0)
    const fixed = Number(answers?.fixedCosts || 0)
    const hoursDay = Number(answers?.workHoursDay || 6)
    const daysMonth = Number(answers?.workDaysMonth || 22)
    const tax = Number(answers?.taxPercentage || 6)
    const reserve = Number(answers?.contingencyReserve || 10)
    const profit = Number(answers?.profitMargin || 20)

    const totalMonthlyCost = salary + fixed
    const totalHoursMonth = hoursDay * daysMonth
    
    if (totalHoursMonth === 0) return null

    const baseHourlyRate = totalMonthlyCost / totalHoursMonth
    const rateWithTax = baseHourlyRate / (1 - tax / 100)
    const rateWithReserve = rateWithTax * (1 + reserve / 100)
    const finalRate = rateWithReserve * (1 + profit / 100)

    return {
      totalMonthlyCost,
      totalHoursMonth,
      baseHourlyRate,
      finalRate
    }
  }, [answers])

  const nextStep = async () => {
    let fields: any[] = []
    if (step === 1) fields = ['orgName', 'slug']
    if (step === 2) fields = ['profile']
    if (step === 3) {
      // Quando avança da calibragem, injetamos o valor hora final calculado
      if (calculatedStats) {
        setValue('answers.hourlyRate', Math.ceil(calculatedStats.finalRate).toString())
      }
      fields = ['answers']
    }

    const isValid = await trigger(fields)
    if (isValid) setStep((s) => s + 1)
  }

  const prevStep = () => setStep((s) => s - 1)

  const onSubmit = async (values: OnboardingInput) => {
    setLoading(true)
    try {
      const { error: orgError } = await organization.create({
        name: values.orgName,
        slug: values.slug,
      })

      if (orgError) {
        setError('slug', { message: 'Este slug já está em uso ou é inválido.' })
        setStep(1)
        return
      }

      const result = await completeOnboardingAction(values)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Workspace configurado com sucesso!')
      window.location.assign('/dashboard')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao finalizar onboarding.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-x-hidden">
      {/* Sidebar de Progresso */}
      <div className="w-full md:w-80 bg-gray-900 text-white p-8 md:p-12 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">ScopeFlow</span>
          </div>

          <div className="space-y-8">
            {steps.map((s) => (
              <div key={s.id} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all",
                    step === s.id ? "border-brand bg-brand text-white scale-125" : 
                    step > s.id ? "border-brand bg-brand text-white" : "border-gray-700 text-gray-500"
                  )}>
                    {step > s.id ? <Check className="w-3 h-3" /> : s.id}
                  </div>
                  {s.id !== 4 && <div className={cn("w-0.5 h-10 mt-1 rounded-full", step > s.id ? "bg-brand" : "bg-gray-800")} />}
                </div>
                <div>
                  <p className={cn("text-sm font-bold leading-none mb-1", step === s.id ? "text-white" : "text-gray-500")}>
                    {s.name}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:block">
          <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
            <p className="text-xs text-gray-400 leading-relaxed italic">
              "A melhor ferramenta para precificar seus projetos de forma inteligente e lucrativa."
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-8 md:p-20 flex items-start justify-center overflow-y-auto">
        <div className="max-w-4xl w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8 max-w-2xl mx-auto"
                >
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Primeiro, vamos dar um nome à sua casa.</h2>
                    <p className="text-gray-500">Isso ajudará a organizar seus orçamentos e clientes.</p>
                  </div>

                  <div className="space-y-6">
                    <Controller
                      control={control}
                      name="orgName"
                      render={({ field }) => (
                        <Field className="space-y-3">
                          <FieldLabel className="text-sm font-black uppercase tracking-widest text-gray-400">Nome do seu negócio</FieldLabel>
                          <Input
                            placeholder="Ex: Minha Software House"
                            className="h-16 text-xl bg-white border-gray-100 rounded-2xl shadow-sm focus:ring-brand focus:border-brand transition-all px-6"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              setValue(
                                'slug',
                                e.target.value
                                  .toLowerCase()
                                  .trim()
                                  .replace(/\s+/g, '-')
                                  .replace(/[^a-z0-9-]/g, ''),
                                { shouldValidate: true }
                              )
                            }}
                          />
                          <FieldError errors={[errors.orgName]} />
                        </Field>
                      )}
                    />

                    <Controller
                      control={control}
                      name="slug"
                      render={({ field }) => (
                        <Field className="space-y-3">
                          <FieldLabel className="text-sm font-black uppercase tracking-widest text-gray-400">Link do seu workspace</FieldLabel>
                          <div className="flex items-center">
                            <div className="h-16 flex items-center px-6 bg-gray-100 border border-r-0 border-gray-100 rounded-l-2xl text-gray-400 font-medium text-lg">
                              scopeflow.com/
                            </div>
                            <Input 
                              className="h-16 text-lg bg-white border-gray-100 rounded-l-none rounded-r-2xl shadow-sm focus:ring-brand focus:border-brand transition-all px-6"
                              {...field} 
                            />
                          </div>
                          <FieldError errors={[errors.slug]} />
                        </Field>
                      )}
                    />
                  </div>

                  <Button type="button" className="w-full h-16 bg-gray-900 text-white hover:bg-black rounded-2xl text-lg font-bold gap-3 shadow-xl" onClick={nextStep}>
                    Continuar <ArrowRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8 max-w-2xl mx-auto"
                >
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Como você atua hoje?</h2>
                    <p className="text-gray-500">Seu perfil calibra nossa inteligência de estimativas.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profiles.map((p) => (
                    <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setValue('profile', p.id as any)
                      // Não resetamos mais tudo, apenas campos específicos se necessário
                    }}
                    className={cn(
                      'p-6 rounded-[24px] border-2 text-left transition-all group relative overflow-hidden',
                      profile === p.id
                        ? 'border-brand bg-brand/5 shadow-lg shadow-brand/5'
                        : 'border-white bg-white hover:border-brand/30 hover:shadow-xl'
                    )}
                    >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                      profile === p.id ? "bg-brand text-white" : "bg-gray-50 text-gray-400 group-hover:bg-brand/10 group-hover:text-brand"
                    )}>
                      <p.icon className="w-6 h-6" />
                    </div>
                    <div className="font-black text-gray-900 mb-1">{p.title}</div>
                    <div className="text-xs text-gray-500 leading-relaxed">
                      {p.description}
                    </div>

                    {profile === p.id && (
                      <div className="absolute top-4 right-4 bg-brand text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                    </button>
                    ))}

                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="ghost" className="h-16 px-8 rounded-2xl text-gray-400" onClick={prevStep}>
                      Voltar
                    </Button>
                    <Button type="button" className="flex-1 h-16 bg-gray-900 text-white hover:bg-black rounded-2xl text-lg font-bold gap-3" onClick={nextStep}>
                      Continuar <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && currentProfile && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Calculadora de Valor Hora</h2>
                    <p className="text-gray-500">Defina sua meta financeira e nós calculamos quanto sua hora deve valer.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Campos de Input */}
                    <div className="space-y-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentProfile.questions.map((q) => (
                          <Controller
                            key={q.id}
                            control={control}
                            name={`answers.${q.id}` as any}
                            render={({ field }) => (
                              <Field className="space-y-2">
                                <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">{q.label}</FieldLabel>
                                {q.type === 'select' ? (
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="h-12 bg-gray-50 border-none rounded-xl text-base px-4">
                                      <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {q.options?.map((o) => (
                                        <SelectItem key={o} value={o}>{o}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    type={q.type}
                                    placeholder={q.placeholder}
                                    className="h-12 text-base bg-gray-50 border-none rounded-xl px-4 font-medium"
                                    {...field}
                                  />
                                )}
                              </Field>
                            )}
                          />
                        ))}
                        
                        <Controller
                          control={control}
                          name="answers.workDaysMonth"
                          render={({ field }) => (
                            <Field className="space-y-2">
                              <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dias úteis/mês</FieldLabel>
                              <Input type="number" className="h-12 bg-gray-50 border-none rounded-xl px-4" {...field} />
                            </Field>
                          )}
                        />
                        <Controller
                          control={control}
                          name="answers.contingencyReserve"
                          render={({ field }) => (
                            <Field className="space-y-2">
                              <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reserva (%)</FieldLabel>
                              <Input type="number" className="h-12 bg-gray-50 border-none rounded-xl px-4" {...field} />
                            </Field>
                          )}
                        />
                        <Controller
                          control={control}
                          name="answers.profitMargin"
                          render={({ field }) => (
                            <Field className="space-y-2">
                              <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400">Margem de Lucro (%)</FieldLabel>
                              <Input type="number" className="h-12 bg-gray-50 border-none rounded-xl px-4" {...field} />
                            </Field>
                          )}
                        />
                      </div>
                    </div>

                    {/* Resumo dos Cálculos */}
                    <div className="sticky top-0 space-y-6">
                      <div className="bg-gray-900 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-8">Custos e Hora Calculados</h3>
                        
                        <div className="space-y-6">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-medium">Custo total mensal</span>
                            <span className="font-mono font-bold text-gray-200">
                              {calculatedStats?.totalMonthlyCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-medium">Horas disponíveis/mês</span>
                            <span className="font-mono font-bold text-gray-200">{calculatedStats?.totalHoursMonth}h</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-medium">Custo hora base</span>
                            <span className="font-mono text-gray-400">
                              {calculatedStats?.baseHourlyRate.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/h
                            </span>
                          </div>
                          
                          <div className="pt-6 mt-6 border-t border-white/5">
                            <p className="text-[10px] font-black uppercase text-brand mb-2 tracking-widest">⭐ HORA FINAL COM LUCRO</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-5xl font-mono font-black text-white">
                                R$ {Math.ceil(calculatedStats?.finalRate || 0)}
                              </span>
                              <span className="text-gray-500 font-bold">/h</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button type="button" variant="ghost" className="h-16 px-8 rounded-2xl text-gray-400" onClick={prevStep}>
                          Voltar
                        </Button>
                        <Button type="button" className="flex-1 h-16 bg-gray-900 text-white hover:bg-black rounded-2xl text-lg font-bold gap-3" onClick={nextStep}>
                          Confirmar Valor <ArrowRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8 max-w-4xl mx-auto"
                >
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Para finalizar, escolha seu plano.</h2>
                    <p className="text-gray-500">Você pode mudar isso a qualquer momento.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { 
                        id: 'free', 
                        title: 'Grátis', 
                        price: 'R$ 0',
                        icon: Star, 
                        desc: 'Para começar a organizar', 
                        color: 'text-gray-400',
                        features: ['5 orçamentos ativos', 'Catálogo básico', 'Proposta em PDF']
                      },
                      { 
                        id: 'basic', 
                        title: 'Pro', 
                        price: 'R$ 49',
                        icon: Zap, 
                        desc: 'Solução para profissionais', 
                        color: 'text-brand', 
                        popular: true,
                        features: ['Orçamentos ilimitados', 'Catálogo ilimitado', 'Link dinâmico', 'Métricas de conversão']
                      },
                      { 
                        id: 'pro', 
                        title: 'Equipe', 
                        price: 'R$ 129',
                        icon: Crown, 
                        desc: 'Gestão para times', 
                        color: 'text-orange-500',
                        features: ['Até 5 membros', 'Templates customizados', 'Painel administrativo', 'Suporte prioritário']
                      },
                    ].map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setValue('plan', plan.id as any)}
                        className={cn(
                          'p-8 rounded-[32px] border-2 text-left transition-all flex flex-col group relative h-full',
                          planValue === plan.id
                            ? 'border-brand bg-brand/5 shadow-2xl shadow-brand/10 z-10'
                            : 'border-white bg-white hover:border-brand/30 hover:shadow-xl'
                        )}
                      >
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", plan.color, "bg-gray-50")}>
                          <plan.icon className="w-6 h-6" />
                        </div>
                        
                        <div className="mb-6">
                          <div className="font-black text-gray-900 text-xl mb-1">{plan.title}</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-gray-900">{plan.price}</span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">/mês</span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
                          {plan.desc}
                        </div>

                        <div className="space-y-3 mb-8 flex-1">
                          {plan.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                              <Check className="w-3.5 h-3.5 text-brand" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        
                        {plan.popular && (
                          <div className="absolute top-4 right-4 bg-brand text-[8px] font-black text-white uppercase px-3 py-1.5 rounded-full tracking-widest shadow-lg shadow-brand/20">
                            Mais Popular
                          </div>
                        )}

                        <div className={cn(
                          "w-full h-12 rounded-xl flex items-center justify-center font-black text-sm transition-all",
                          planValue === plan.id ? "bg-brand text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-900 group-hover:text-white"
                        )}>
                          {planValue === plan.id ? 'Selecionado' : 'Selecionar'}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="ghost" className="h-16 px-8 rounded-2xl text-gray-400" onClick={prevStep}>
                      Voltar
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1 h-16 bg-brand text-white hover:bg-brand-dark rounded-2xl text-lg font-bold shadow-xl shadow-brand/20">
                      {loading ? 'Configurando...' : 'Finalizar Setup'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  )
}

