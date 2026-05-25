import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { defaultCategories, defaultFeatures } from './seed-data'

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  console.log('🌱 Iniciando seed...')

  try {
    // 1. Criar Categorias Padrão
    for (const cat of defaultCategories) {
      await prisma.category.upsert({
        where: { id: `default-${cat.name}` }, // Note: This might need adjustment as id is uuid in schema
        update: {},
        create: {
          name: cat.name,
          organizationId: 'seed-org-id', // Placeholder or real org id
        },
      })
    }

    console.log('✅ Seed finalizado com sucesso!')
  } catch (error) {
    console.error('❌ Erro no seed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
