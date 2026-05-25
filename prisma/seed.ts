import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../src/generated/prisma/client'
import { defaultCategories, defaultFeatures } from './seed-data'

async function main() {
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: Number(process.env.DATABASE_PORT || 3306),
  })

  const prisma = new PrismaClient({ adapter })

  console.log('🌱 Iniciando seed global...')

  // 1. Criar Organização de Exemplo
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp (Exemplo)',
      slug: 'acme-corp',
    },
  })

  console.log(`🏢 Organização: ${org.name} (${org.id})`)

  const categoriesMap: Record<string, string> = {}

  // 2. Criar Categorias
  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, organizationId: org.id },
    })

    let catId: string
    if (!existing) {
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          organizationId: org.id,
        },
      })
      catId = created.id
      console.log(`✅ Categoria criada: ${cat.name}`)
    } else {
      catId = existing.id
    }
    categoriesMap[cat.name] = catId
  }

  // 3. Criar Funcionalidades
  for (const feature of defaultFeatures) {
    const existing = await prisma.feature.findFirst({
      where: { name: feature.name, organizationId: org.id },
    })

    if (!existing) {
      await prisma.feature.create({
        data: {
          name: feature.name,
          description: feature.description,
          baseHours: feature.baseHours,
          complexity: feature.complexity,
          categoryId: categoriesMap[feature.categoryName],
          organizationId: org.id,
        },
      })
      console.log(`✨ Funcionalidade criada: ${feature.name}`)
    }
  }

  console.log('🏁 Seed finalizado com sucesso!')
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
