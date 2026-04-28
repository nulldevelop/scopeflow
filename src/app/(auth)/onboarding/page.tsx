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
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldContent,
} from '@/components/ui/field'
import { organization, useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { completeOnboardingAction } from './_actions/complete-onboarding'
import { onboardingSchema, type OnboardingInput } from './_schemas/onboarding-schema'

const profiles = [
  {
    id: 'freelancer',
    title: 'Freelancer',
    icon: Code2,
    description: 'Trabalho independente',
    questions: [
      { id: 'hourlyRate', label: 'Valor da hora (R$)', type: 'number', placeholder: '150' },
      { id: 'workModel', label: 'Modelo de Trabalho', type: 'select', options: ['Remoto', 'Presencial', 'Híbrido'] }
    ]
  },
  {
    id: 'software_house',
    title: 'Software House',
    icon: Building2,
    description: 'Fábrica de software',
    questions: [
      { id: 'hourlyRate', label: 'Valor hora médio (R$)', type: 'number', placeholder: '200' },
      { id: 'teamSize', label: 'Tamanho da Equipe', type: 'select', options: ['1-5', '6-15', '15-30', '30+'] }
    ]
  },
  {
    id: 'agencia',
    title: 'Agência Digital',
    icon: Layout,
    description: 'Serviços criativos',
    questions: [
      { id: 'hourlyRate', label: 'Valor hora médio (R$)', type: 'number', placeholder: '180' },
      { id: 'services', label: 'Principal Serviço', type: 'select', options: ['Web', 'Mobile', 'UI/UX', 'Marketing'] }
    ]
  },
  {
    id: 'saas_startup',
    title: 'SaaS / Startup',
    icon: Rocket,
    description: 'Meu próprio produto',
    questions: [
      { id: 'productName', label: 'Nome do Produto', type: 'text', placeholder: 'Meu SaaS' },
      { id: 'stage', label: 'Estágio Atual', type: 'select', options: ['Ideação', 'MVP', 'Mercado', 'Escala'] }
    ]
  },
]

const plans = [
  { id: 'free', title: 'Free', icon: Star, color: 'text-gray-400' },
  { id: 'basic', title: 'Basic', icon: Zap, color: 'text-blue-500', popular: true },
  { id: 'pro', title: 'Pro', icon: Crown, color: 'text-brand' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      orgName: '',
      slug: '',
      profile: undefined as any,
      answers: {},
      plan: 'basic',
      invites: [],
    } as OnboardingInput,
  })

  const { control, handleSubmit, setValue, watch, trigger, setError, formState: { errors } } = form

  const currentProfile = profiles.find(p => p.id === watch('profile'))

  const nextStep = async () => {
    let fields: any[] = []
    if (step === 1) fields = ['orgName', 'slug']
    if (step === 2) fields = ['profile']
    if (step === 3) fields = ['answers']

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
      if (result.success) {
        router.push('/dashboard')
        router.refresh()
      } else {
        alert(result.error)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-lg max-h-[95vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <DialogTitle>Configurando seu Workspace</DialogTitle>
          <DialogDescription>Falta pouco para você começar!</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <Controller
                  control={control}
                  name="orgName"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Nome da Organização</FieldLabel>
                      <Input
                        placeholder="Ex: Scope Digital"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          setValue('slug', e.target.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
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
                    <Field>
                      <FieldLabel>URL do Workspace</FieldLabel>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">scopeflow.com/</span>
                        <Input {...field} />
                      </div>
                      <FieldError errors={[errors.slug]} />
                    </Field>
                  )}
                />
                <Button type="button" className="w-full" onClick={nextStep}>Próximo</Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <Field>
                  <FieldLabel>Qual o seu perfil de trabalho?</FieldLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setValue('profile', p.id as any)
                          setValue('answers', {}) // Reset answers when profile changes
                        }}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all",
                          watch('profile') === p.id ? "border-brand bg-brand/5" : "border-border hover:border-brand/50"
                        )}
                      >
                        <p.icon className={cn("w-5 h-5 mb-2", watch('profile') === p.id ? "text-brand" : "text-muted-foreground")} />
                        <div className="font-bold text-sm">{p.title}</div>
                        <div className="text-xs text-muted-foreground">{p.description}</div>
                      </button>
                    ))}
                  </div>
                  <FieldError errors={[errors.profile]} />
                </Field>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={prevStep}>Voltar</Button>
                  <Button type="button" className="flex-1" onClick={nextStep}>Próximo</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && currentProfile && (
              <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <FieldLabel className="text-base font-semibold mb-2 block">Personalize sua experiência</FieldLabel>
                <FieldGroup>
                  {currentProfile.questions.map((q) => (
                    <Controller
                      key={q.id}
                      control={control}
                      name={`answers.${q.id}` as any}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>{q.label}</FieldLabel>
                          {q.type === 'select' ? (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                {q.options?.map(o => (
                                  <SelectItem key={o} value={o}>{o}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input type={q.type} placeholder={q.placeholder} {...field} />
                          )}
                          <FieldError errors={[errors.answers?.[q.id] as any]} />
                        </Field>
                      )}
                    />
                  ))}
                </FieldGroup>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={prevStep}>Voltar</Button>
                  <Button type="button" className="flex-1" onClick={nextStep}>Próximo</Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                 <Field>
                   <FieldLabel>Escolha seu plano inicial</FieldLabel>
                   <div className="grid grid-cols-3 gap-2">
                     {plans.map((plan) => (
                       <button
                         key={plan.id}
                         type="button"
                         onClick={() => setValue('plan', plan.id as any)}
                         className={cn(
                           "p-3 rounded-lg border-2 text-center relative",
                           watch('plan') === plan.id ? "border-brand bg-brand/5" : "border-border"
                         )}
                       >
                         <plan.icon className={cn("w-5 h-5 mx-auto mb-2", plan.color)} />
                         <div className="text-xs font-bold">{plan.title}</div>
                       </button>
                     ))}
                   </div>
                   <FieldError errors={[errors.plan]} />
                 </Field>
                 <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={prevStep}>Voltar</Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Configurando..." : "Finalizar Configuração"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </DialogContent>
    </Dialog>
  )
}
