'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Save,
  Shield,
  User,
  Settings,
} from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Header } from '@/components/shared/Header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { updateSettingsAction } from '../_actions/update-settings'
import { type SettingsInput, settingsSchema } from '../_schemas/settings'

interface SettingsClientProps {
  initialData: {
    user: {
      id: string
      name: string
      email: string
      image: string | null
    }
    organization: {
      id: string
      name: string
      slug: string
      metadata: {
        profile: string
        answers: {
          taxPercentage: string
          workHoursDay: string
          workDaysMonth: string
          desiredSalary: string
          fixedCosts: string
          profitMargin: string
        }
        plan: string
      }
      subscription: {
        plan: string
        status: string
        currentPeriodEnd: string | null
      } | null
      billingHistory: {
        id: string
        amount: string
        status: string
        createdAt: string
      }[]
    }
  }
  initialTab?: string
  paymentRequired?: boolean
}

const tabs = [
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
  { id: 'pagamento', label: 'Pagamento', icon: CreditCard },
]

export function SettingsClient({
  initialData,
  initialTab = 'perfil',
  paymentRequired = false,
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = React.useState(initialTab)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isRedirecting, setIsRedirecting] = React.useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialData.user.name,
      email: initialData.user.email,
      image: initialData.user.image || undefined,
      taxPercentage: initialData.organization.metadata.answers.taxPercentage,
      workHoursDay: initialData.organization.metadata.answers.workHoursDay,
      workDaysMonth: initialData.organization.metadata.answers.workDaysMonth,
      desiredSalary: initialData.organization.metadata.answers.desiredSalary,
      fixedCosts: initialData.organization.metadata.answers.fixedCosts,
      profitMargin: initialData.organization.metadata.answers.profitMargin,
    },
  })

  useEffect(() => {
    if (paymentRequired) {
      toast.error(
        'Você precisa finalizar o pagamento da sua assinatura para acessar o painel.',
        {
          duration: 8000,
          position: 'top-center',
        },
      )
    }
  }, [paymentRequired])

  const formData = watch()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setValue('image', base64String, { shouldDirty: true })
      }
      reader.readAsDataURL(file)
    }
  }

  const hourlyRate = useMemo(() => {
    const desiredSalary = Number(formData.desiredSalary) || 0
    const fixedCosts = Number(formData.fixedCosts) || 0
    const taxPercentage = Number(formData.taxPercentage) || 0
    const profitMargin = Number(formData.profitMargin) || 0
    const workHoursDay = Number(formData.workHoursDay) || 0
    const workDaysMonth = Number(formData.workDaysMonth) || 22

    const monthlyGoal =
      (desiredSalary + fixedCosts) / (1 - (taxPercentage + profitMargin) / 100)
    const hoursPerMonth = workHoursDay * workDaysMonth

    return hoursPerMonth > 0 ? Math.ceil(monthlyGoal / hoursPerMonth) : 0
  }, [formData])

  const onSubmit = async (data: SettingsInput) => {
    setIsSaving(true)
    try {
      const result = await updateSettingsAction(data)
      if (result.success) {
        toast.success('Configurações salvas com sucesso!')
      } else {
        toast.error(result.error || 'Erro ao salvar configurações.')
      }
    } catch (error) {
      toast.error('Erro de conexão.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpgrade = async (plan: string) => {
    setIsRedirecting(true)
    try {
      const { createCheckoutAction } = await import(
        '../_actions/create-checkout'
      )
      const res = await createCheckoutAction(plan)
      if (res.success && res.data?.url) {
        window.location.href = res.data.url
      } else {
        toast.error(res.error || 'Erro ao iniciar checkout')
      }
    } catch (error) {
      toast.error('Erro ao processar upgrade')
    } finally {
      setIsRedirecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3]">
      <Header
        title="Configurações"
        subtitle="Gerencie seu perfil, preferências e detalhes da sua assinatura"
        icon={Settings}
      >
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={!isDirty || isSaving}
          className="bg-white text-gray-900 hover:bg-gray-50 rounded-xl flex items-center gap-2 px-5 py-2.5 font-medium transition-all shadow-lg shadow-brand/10"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </Header>

      <div className="px-8 -mt-14 relative z-10 pb-12">
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto">
          {/* Sidebar Tabs */}
          <aside className="w-full lg:w-64 space-y-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-200 bg-transparent',
                )}
              >
                <tab.icon
                  className={cn(
                    'w-4 h-4',
                    activeTab === tab.id ? 'text-white' : 'text-gray-400',
                  )}
                />
                {tab.label}
              </Button>
            ))}
          </aside>

          {/* Content Area */}
          <main className="flex-1">
            <Card className="p-8 bg-white border border-gray-200 rounded-[20px]">
              <form onSubmit={handleSubmit(onSubmit)}>
                {activeTab === 'perfil' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Informações do Perfil
                      </h3>
                      <p className="text-sm text-gray-500">
                        Atualize seus dados pessoais e profissionais.
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <div className="w-20 h-20 rounded-2xl bg-brand-light flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                        {formData.image ? (
                          <Image
                            src={formData.image}
                            alt={formData.name}
                            className="w-full h-full object-cover"
                            width={80}
                            height={80}
                          />
                        ) : (
                          <span className="text-brand font-bold text-2xl">
                            {formData.name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mb-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Alterar foto
                        </Button>
                        <p className="text-[11px] text-gray-400">
                          JPG, GIF ou PNG. Máximo de 2MB.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                          id="name"
                          {...register('name')}
                          className="rounded-lg h-11"
                        />
                        {errors.name && (
                          <p className="text-xs text-red-500">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          {...register('email')}
                          className="rounded-lg h-11"
                        />
                        {errors.email && (
                          <p className="text-xs text-red-500">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Calibragem Financeira
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="desiredSalary">
                            Salário Desejado (R$)
                          </Label>
                          <Input
                            id="desiredSalary"
                            type="number"
                            {...register('desiredSalary')}
                            className="rounded-lg h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fixedCosts">Custos Fixos (R$)</Label>
                          <Input
                            id="fixedCosts"
                            type="number"
                            {...register('fixedCosts')}
                            className="rounded-lg h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taxPercentage">% Imposto</Label>
                          <Input
                            id="taxPercentage"
                            type="number"
                            {...register('taxPercentage')}
                            className="rounded-lg h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="workHoursDay">Horas/dia</Label>
                          <Input
                            id="workHoursDay"
                            type="number"
                            {...register('workHoursDay')}
                            className="rounded-lg h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="workDaysMonth">Dias/mês</Label>
                          <Input
                            id="workDaysMonth"
                            type="number"
                            {...register('workDaysMonth')}
                            className="rounded-lg h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profitMargin">
                            % Margem de Lucro
                          </Label>
                          <Input
                            id="profitMargin"
                            type="number"
                            {...register('profitMargin')}
                            className="rounded-lg h-11"
                          />
                        </div>
                      </div>

                      <div className="mt-8 p-6 bg-brand/5 rounded-2xl border border-brand/10 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-brand uppercase tracking-wider mb-1">
                            Seu Valor Hora Sugerido
                          </p>
                          <p className="text-3xl font-black text-gray-900 font-mono">
                            R$ {hourlyRate}
                          </p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>
                            Faturamento alvo:{' '}
                            <span className="font-bold text-gray-900">
                              R${' '}
                              {Math.ceil(
                                ((Number(formData.desiredSalary) || 0) +
                                  (Number(formData.fixedCosts) || 0)) /
                                  (1 -
                                    (Number(formData.taxPercentage) ||
                                      0 +
                                        (Number(formData.profitMargin) || 0)) /
                                      100),
                              )}
                            </span>
                          </p>
                          <p>
                            Horas mensais:{' '}
                            <span className="font-bold text-gray-900">
                              {(Number(formData.workHoursDay) || 0) *
                                (Number(formData.workDaysMonth) || 0)}
                              h
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'pagamento' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Assinatura e Cobrança
                      </h3>
                      <p className="text-sm text-gray-500">
                        Gerencie seu plano e visualize seu histórico de
                        pagamentos.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          id: 'free',
                          name: 'Grátis',
                          price: 'R$ 0',
                          description: 'Para quem está começando.',
                          features: [
                            '5 orçamentos/mês',
                            'Catálogo de 20 itens',
                            'PDF profissional',
                          ],
                          color: 'bg-gray-100 text-gray-600',
                        },
                        {
                          id: 'pro',
                          name: 'Pro',
                          price: 'R$ 49',
                          description: 'Para profissionais em crescimento.',
                          features: [
                            'Ilimitado',
                            'Link dinâmico',
                            'Suporte prioritário',
                          ],
                          color: 'bg-brand/10 text-brand',
                          popular: true,
                        },
                        {
                          id: 'equipe',
                          name: 'Equipe',
                          price: 'R$ 129',
                          description: 'Para times e agências.',
                          features: [
                            'Tudo do Pro',
                            'Até 5 membros',
                            'Painel Admin',
                          ],
                          color: 'bg-gray-900 text-white',
                        },
                      ].map((plan) => {
                        const isCurrent =
                          (initialData.organization.subscription?.plan ||
                            initialData.organization.metadata.plan ||
                            'free') === plan.id
                        return (
                          <Card
                            key={plan.id}
                            className={cn(
                              'relative p-6 border transition-all flex flex-col',
                              isCurrent
                                ? 'border-brand shadow-lg ring-1 ring-brand/10'
                                : 'border-gray-100 hover:border-gray-200',
                            )}
                          >
                            {plan.popular && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                Mais Popular
                              </div>
                            )}
                            <div className="mb-6">
                              <div
                                className={cn(
                                  'inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase mb-4',
                                  plan.color,
                                )}
                              >
                                {plan.name}
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-gray-900 font-mono">
                                  {plan.price}
                                </span>
                                <span className="text-gray-400 text-xs">
                                  /mês
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-2 min-h-[32px]">
                                {plan.description}
                              </p>
                            </div>

                            <ul className="space-y-2 mb-8 flex-1">
                              {plan.features.map((f) => (
                                <li
                                  key={f}
                                  className="flex items-center gap-2 text-[11px] text-gray-600"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-brand" />{' '}
                                  {f}
                                </li>
                              ))}
                            </ul>

                            {isCurrent ? (
                              <div className="w-full h-11 bg-gray-50 rounded-xl flex items-center justify-center text-[11px] font-bold text-gray-400 border border-gray-100">
                                Plano Atual
                              </div>
                            ) : plan.id === 'free' ? (
                              <Button
                                type="button"
                                onClick={() =>
                                  toast.info(
                                    'Para retornar ao plano Grátis, cancele sua assinatura atual via painel de faturas.',
                                  )
                                }
                                className="w-full h-11 rounded-xl text-[11px] font-bold transition-all bg-gray-100 text-gray-500 hover:bg-gray-200"
                              >
                                Reverter para Grátis
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={isRedirecting}
                                className={cn(
                                  'w-full h-11 rounded-xl text-[11px] font-bold transition-all active:scale-95',
                                  plan.id === 'equipe'
                                    ? 'bg-gray-900 hover:bg-black text-white'
                                    : 'bg-brand hover:bg-brand-dark text-white',
                                )}
                              >
                                {isRedirecting ? '...' : `Assinar ${plan.name}`}
                              </Button>
                            )}
                          </Card>
                        )
                      })}
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">
                        Histórico de Faturas
                      </h3>
                      <div className="overflow-hidden border border-gray-100 rounded-xl">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                              <th className="px-6 py-4 font-semibold text-gray-900">
                                Data
                              </th>
                              <th className="px-6 py-4 font-semibold text-gray-900">
                                Valor
                              </th>
                              <th className="px-6 py-4 font-semibold text-gray-900">
                                Status
                              </th>
                              <th className="px-6 py-4 font-semibold text-gray-900 text-right">
                                Ação
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {initialData.organization.billingHistory.length >
                            0 ? (
                              initialData.organization.billingHistory.map(
                                (invoice) => (
                                  <tr key={invoice.id}>
                                    <td className="px-6 py-4 text-gray-600">
                                      {new Date(
                                        invoice.createdAt,
                                      ).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                                      R$ {invoice.amount}
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-50 text-green-700">
                                        {invoice.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-brand text-xs font-bold"
                                      >
                                        PDF
                                      </Button>
                                    </td>
                                  </tr>
                                ),
                              )
                            ) : (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-6 py-12 text-center text-gray-400 text-xs"
                                >
                                  Nenhuma fatura encontrada.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab !== 'perfil' && activeTab !== 'pagamento' && (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Em desenvolvimento
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      Esta seção de configurações está sendo preparada e estará
                      disponível em breve.
                    </p>
                  </div>
                )}
              </form>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
