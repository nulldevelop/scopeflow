import { type NextRequest, NextResponse } from 'next/server'
import { auth } from './lib/auth'

const publicRoutes = ['/', '/signin']

export const runtime = 'nodejs'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const sessionToken = req.cookies.get('better-auth.session_token')?.value

  const isPublic = publicRoutes.includes(pathname)

  if (!sessionToken) {
    if (isPublic) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (!session) {
    if (isPublic) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  const activeOrgId = (session.session as { activeOrganizationId?: string })
    .activeOrganizationId

  if (pathname === '/signin') {
    const hasOrg = !!activeOrgId
    return NextResponse.redirect(
      new URL(hasOrg ? '/dashboard' : '/onboarding', req.url),
    )
  }

  if (!activeOrgId && pathname !== '/onboarding') {
    if (!isPublic) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
  }

  if (activeOrgId && pathname === '/onboarding') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

//! 🔹 Define onde o middleware roda
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
