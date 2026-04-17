'use client'

import { Check, Quote } from 'lucide-react'
import Link from 'next/link'
import { BorderBeam } from '@/components/magicui/border-beam'
import { Meteors } from '@/components/magicui/meteors'
import { Button } from '@/components/ui/button'
import { signIn } from '@/lib/auth-client'

export default function SigninPage() {
  const handleSignIn = async (provider: 'google' | 'github') => {
    await signIn.social({
      provider,
      callbackURL: '/dashboard',
    })
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background font-sans">
      {/* Left Side: Branding & Testimonial */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-brand-deep relative overflow-hidden">
        <Meteors number={20} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(42,107,92,0.4),transparent_70%)]" />

        <Link href="/" className="relative z-10 flex items-center gap-3 group">
          <div className="relative">
            <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
              <rect width="60" height="60" rx="14" fill="#2A6B5C" />
              <rect
                x="13"
                y="34"
                width="7"
                height="13"
                rx="2"
                fill="white"
                opacity="0.4"
              />
              <rect
                x="23"
                y="26"
                width="7"
                height="21"
                rx="2"
                fill="white"
                opacity="0.65"
              />
              <rect x="33" y="17" width="7" height="30" rx="2" fill="white" />
              <path
                d="M39 14 L46 8 M46 8 L41.5 8 M46 8 L46 12.5"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-white text-xl font-semibold tracking-tight">
            ScopeFlow
          </span>
        </Link>

        <div className="relative z-10">
          <div className="mb-8">
            <Quote className="size-10 text-brand-mid/50 mb-6" />
            <h2 className="text-3xl font-medium text-white leading-tight mb-6">
              "O ScopeFlow mudou a forma como apresento meus orçamentos. Hoje
              fecho projetos 40% mais rápido."
            </h2>
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-brand-mid/20 border border-brand-mid/30 flex items-center justify-center text-brand-mid font-semibold">
                PA
              </div>
              <div>
                <p className="text-white font-medium">Pedro Andrade</p>
                <p className="text-brand-mid/60 text-sm">Fullstack Developer</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-3 text-brand-mid/80">
              <Check className="size-5 text-brand" />
              <span className="text-sm">Cálculo Automático</span>
            </div>
            <div className="flex items-center gap-3 text-brand-mid/80">
              <Check className="size-5 text-brand" />
              <span className="text-sm">Propostas em PDF</span>
            </div>
            <div className="flex items-center gap-3 text-brand-mid/80">
              <Check className="size-5 text-brand" />
              <span className="text-sm">Gestão de Clientes</span>
            </div>
            <div className="flex items-center gap-3 text-brand-mid/80">
              <Check className="size-5 text-brand" />
              <span className="text-sm">Métricas de Venda</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-brand-mid/40 text-xs">
          © 2026 ScopeFlow. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Side: Sign In Form */}
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50/50 relative">
        <div className="w-full max-sm:max-w-sm">
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-3">
              <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
                <rect width="60" height="60" rx="14" fill="#2A6B5C" />
                <rect
                  x="13"
                  y="34"
                  width="7"
                  height="13"
                  rx="2"
                  fill="white"
                  opacity="0.4"
                />
                <rect
                  x="23"
                  y="26"
                  width="7"
                  height="21"
                  rx="2"
                  fill="white"
                  opacity="0.65"
                />
                <rect x="33" y="17" width="7" height="30" rx="2" fill="white" />
                <path
                  d="M39 14 L46 8 M46 8 L41.5 8 M46 8 L46 12.5"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-gray-900 text-xl font-semibold tracking-tight">
                ScopeFlow
              </span>
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Acesse sua conta
            </h1>
            <p className="text-gray-500">
              Escolha seu método de login preferido para começar.
            </p>
          </div>

          <div className="space-y-4 relative p-1">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
              <BorderBeam size={200} duration={8} delay={0} />

              <div className="space-y-3 relative z-10">
                <Button
                  variant="outline"
                  className="w-full h-12 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 gap-3 transition-all rounded-xl"
                  onClick={() => handleSignIn('google')}
                >
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Entrar com Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 gap-3 transition-all rounded-xl"
                  onClick={() => handleSignIn('github')}
                >
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>GitHub</title>
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  Entrar com GitHub
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 relative z-10">
                <p className="text-center text-xs text-gray-400">
                  Ao entrar, você concorda com nossos <br />
                  <Link
                    href="#"
                    className="underline hover:text-brand transition-colors"
                  >
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link
                    href="#"
                    className="underline hover:text-brand transition-colors"
                  >
                    Privacidade
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-brand transition-colors"
            >
              ← Voltar para a Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
