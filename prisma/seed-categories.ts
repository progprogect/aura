// Seed для миграции категорий из кода в БД

import { PrismaClient } from '@prisma/client'
import { CATEGORY_CONFIG } from '../src/lib/specialist-config'

const prisma = new PrismaClient()

async function seedCategories() {
  console.log('🌱 Миграция категорий из кода в БД...')

  let categoriesCreated = 0
  let fieldsCreated = 0

  for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
    // Проверяем, существует ли категория
    const existing = await prisma.category.findUnique({
      where: { key },
    })

    if (existing) {
      console.log(`⏭️  Категория ${key} уже существует, пропускаем`)
      continue
    }

    // Создаем категорию
    const category = await prisma.category.create({
      data: {
        key,
        name: config.name,
        emoji: config.emoji,
        priceLabel: config.priceLabel,
        order: categoriesCreated,
        isActive: true,
      },
    })

    categoriesCreated++
    console.log(`✅ Создана категория: ${key} (${config.name})`)

    // Создаем поля для категории
    let fieldOrder = 0
    for (const [fieldKey, fieldConfig] of Object.entries(config.fields)) {
      await prisma.categoryField.create({
        data: {
          categoryId: category.id,
          key: fieldKey,
          label: fieldConfig.label,
          icon: fieldConfig.icon,
          type: fieldConfig.type || 'string',
          required: false,
          order: fieldOrder++,
          isActive: true,
        },
      })

      fieldsCreated++
    }
  }

  console.log(`\n📊 Результат миграции:`)
  console.log(`   - Создано категорий: ${categoriesCreated}`)
  console.log(`   - Создано полей: ${fieldsCreated}`)
}

seedCategories()
  .catch(e => {
    console.error('❌ Ошибка при миграции категорий:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

