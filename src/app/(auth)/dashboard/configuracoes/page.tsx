'use client'

import { Bell, CreditCard, Save, Shield, User } from 'lucide-react'
import React from 'react'
import { Header } from '@/components/shared/Header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
  { id: 'pagamento', label: 'Pagamento', icon: CreditCard },
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const user = session?.user
  const [activeTab, setActiveTab] = React.useState('perfil')

  // Mock data for UI until we have a real user profile table
  const mockPlano = 'Pro'
  const mockValorHora = '150'

  if (!user) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="px-8 pb-12">
      <Header title="Configurações">
        <Button className="bg-brand text-white hover:bg-brand-dark rounded-lg flex items-center gap-2">
          <Save className="w-4 h-4" />
          Salvar alterações
        </Button>
      </Header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-md shadow-brand/20'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-200',
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
                  <div className="w-20 h-20 rounded-2xl bg-brand-light flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-brand font-bold text-2xl">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="mb-2">
                      Alterar foto
                    </Button>
                    <p className="text-[11px] text-gray-400">
                      JPG, GIF ou PNG. Máximo de 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      defaultValue={user?.name || ''}
                      className="rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      defaultValue={user?.email || ''}
                      className="rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valorHora">Valor da Hora (R$)</Label>
                    <Input
                      id="valorHora"
                      type="number"
                      defaultValue={mockValorHora}
                      className="rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plano">Plano atual</Label>
                    <div className="h-11 flex items-center px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 capitalize">
                      {mockPlano}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'perfil' && (
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
          </Card>
        </main>
      </div>
    </div>
  )
}
