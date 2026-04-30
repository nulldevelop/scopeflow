import { type NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/', '/signin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Ignorar arquivos estáticos e API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 2. Verificar token de sessão (usando o nome customizado)
  const sessionToken = req.cookies.get('scopeflow.session_token')?.value
  const isPublic = publicRoutes.includes(pathname)

  if (!sessionToken) {
    if (isPublic) return NextResponse.next()
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  // 3. Buscar sessão e organização ativa via cookie (mais rápido que chamar API no middleware)
  const activeOrgId = req.cookies.get('better-auth.active_organization_id')?.value

  // Lógica de Redirecionamento
  if (pathname === '/signin') {
    return NextResponse.redirect(new URL(activeOrgId ? '/dashboard' : '/onboarding', req.url))
  }

  // Se logado mas sem organização, força onboarding (exceto se já estiver lá ou em rota pública)
  if (!activeOrgId && pathname !== '/onboarding' && !isPublic) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  // Se já tem organização, não precisa ir para o onboarding
  if (activeOrgId && pathname === '/onboarding') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Adiciona o pathname nos headers para os Server Components
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
