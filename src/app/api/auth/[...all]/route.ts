import { toNextJsHandler } from 'better-auth/next-js'

export const dynamic = 'force-dynamic'

const { GET, POST } = toNextJsHandler((await import('@/lib/auth')).auth)

export { GET, POST }
