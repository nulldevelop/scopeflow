import { cookies } from 'next/headers'
import { auth } from './auth'

export type SessionClient = {
  success: true
  session: {
    user: {
      id: string
      name: string
      email: string
      image: string
    }
    activeOrganizationId: string
  }
} | { success: false; error: string }

export async function getSessionClient(): Promise<SessionClient> {
  try {
    const cookieStore = await cookies()
    const result = await auth.api.getSession({
      headers: {
        cookie: cookieStore.toString(),
      },
    })
    
    if (!result || !result.session || !result.user) {
      return { success: false, error: 'Sessão inválida' }
    }
    
    return {
      success: true,
      session: {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          image: result.user.image || '',
        },
        activeOrganizationId: (result.session as { activeOrganizationId?: string }).activeOrganizationId || '',
      }
    }
  } catch {
    return { success: false, error: 'Erro ao buscar sessão' }
  }
}
