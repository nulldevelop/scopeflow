'use client'

import {
  ArrowRight01Icon,
  EyeIcon,
  GithubIcon,
  GoogleIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { signIn } from '@/lib/auth-client'

export default function LoginPage() {
  const handleSignIn = async (provider: 'google' | 'github') => {
    await signIn.social({
      provider,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <HugeiconsIcon icon={EyeIcon} className="size-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Bem-vindo ao ScopeFlow</CardTitle>
          <CardDescription>Entre com sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSignIn('google')}
          >
            <HugeiconsIcon icon={GoogleIcon} className="mr-2 size-5" />
            Entrar com Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSignIn('github')}
          >
            <HugeiconsIcon icon={GithubIcon} className="mr-2 size-5" />
            Entrar com GitHub
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
