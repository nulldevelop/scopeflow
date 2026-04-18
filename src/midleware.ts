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

  //! 🔒 Usuário NÃO logado tentando acessar rota privada
  if (!session && !isPublic) {
    const loginUrl = new URL('/signin', req.url)
    return NextResponse.redirect(loginUrl)
  }

  //! 🔒 Usuário logado tentando acessar login
  if (session && pathname === '/signin') {
    const dashboardUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

//! 🔹 Define onde o middleware roda
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
