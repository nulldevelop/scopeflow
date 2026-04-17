import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'

// 🔹 Validação das variáveis de ambiente
function getEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`❌ Variável de ambiente ${name} não definida`)
  }

  return value
}

// 🔹 Configuração do adapter
const adapter = new PrismaMariaDb({
  host: getEnv('DATABASE_HOST'),
  user: getEnv('DATABASE_USER'),
  password: getEnv('DATABASE_PASSWORD'),
  database: getEnv('DATABASE_NAME'),
  connectionLimit: 5,
})

// 🔹 Singleton do Prisma (evita múltiplas conexões em dev)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
