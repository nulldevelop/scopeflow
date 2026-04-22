import { type NextRequest, NextResponse } from 'next/server'
import { auth } from './lib/auth'

//! 🔹 Rotas públicas (não precisam de login)
const publicRoutes = ['/', '/signin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  //! 🔹 Ignora assets e API interna
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  //! 🔹 Verifica sessão
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  const isPublic = publicRoutes.includes(pathname)

  //! 🔒 1. Usuário NÃO logado tentando acessar rota privada
  if (!session) {
    if (isPublic) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  const activeOrgId = (session.session as { activeOrganizationId?: string })
    .activeOrganizationId

  //! 🔓 2. Se o usuário já estiver logado e tentar acessar login
  if (pathname === '/signin') {
    const hasOrg = !!activeOrgId
    return NextResponse.redirect(
      new URL(hasOrg ? '/dashboard' : '/onboarding', req.url),
    )
  }

  //! 🚀 3. Usuário logado mas SEM organização ativa (Obrigatório Onboarding)
  if (!activeOrgId && pathname !== '/onboarding') {
    if (!isPublic) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
  }

  //! 🚀 4. Usuário logado e COM organização, tentando acessar onboarding
  if (activeOrgId && pathname === '/onboarding') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

//! 🔹 Define onde o middleware roda
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
