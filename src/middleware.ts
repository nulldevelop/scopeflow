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

  // 3. Buscar organização ativa via cookie
  const activeOrgId =
    req.cookies.get('scopeflow.active_organization_id')?.value ||
    req.cookies.get('better-auth.active_organization_id')?.value

  // Lógica de Redirecionamento Simples para o Middleware
  if (pathname === '/signin' && sessionToken) {
    return NextResponse.redirect(
      new URL(activeOrgId ? '/dashboard' : '/onboarding', req.url),
    )
  }

  // Se já tem organização, não precisa ir para o onboarding
  if (activeOrgId && pathname === '/onboarding') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // NOTA: Não forçamos o redirecionamento para /onboarding aqui se o cookie estiver faltando.
  // Deixamos o AuthLayout (Server Component) fazer essa verificação no banco de dados,
  // o que evita erros de Edge Runtime e lida melhor com cookies atrasados.

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
