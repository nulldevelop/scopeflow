import { type NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/', '/signin', '/privacidade', '/termos', '/cookies']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Ignorar arquivos estáticos e API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 2. Verificar token de sessão (suportando localhost e produção HTTPS)
  const sessionToken =
    req.cookies.get('scopeflow.session_token')?.value ||
    req.cookies.get('__Secure-scopeflow.session_token')?.value

  const isPublic =
    publicRoutes.includes(pathname) ||
    pathname.includes('/proposta/') ||
    pathname.includes('/contrato/')

  if (!sessionToken) {
    if (isPublic) return NextResponse.next()
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  // Lógica de Redirecionamento Simples para o Middleware
  if (pathname === '/signin' && sessionToken) {
    // Redireciona sempre para o dashboard, o AuthLayout cuidará de mandar para o onboarding se necessário.
    // Isso evita loops se o cookie de organização estiver presente mas a sessão não a tiver ativa.
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // NOTA: Não forçamos o redirecionamento para /onboarding nem para /dashboard aqui.
  // Deixamos o AuthLayout (Server Component) fazer essa verificação no banco de dados,
  // o que evita loops e lida melhor com o estado da sessão.

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
