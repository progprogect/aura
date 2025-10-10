/**
 * Скрипт миграции: Перенос base64 превью в Cloudinary
 * 
 * Что делает:
 * 1. Находит все лид-магниты с base64 previewImage но без previewUrls
 * 2. Загружает base64 в Cloudinary с responsive размерами
 * 3. Обновляет previewUrls в БД
 * 4. Сохраняет бэкап в temporary поле
 * 
 * Использование: npx ts-node prisma/scripts/migrate-preview-to-cdn.ts
 */

import { PrismaClient } from '@prisma/client'
import { uploadPreviewFromDataUrl } from '../../src/lib/cloudinary/preview-uploader'

const prisma = new PrismaClient()

interface MigrationStats {
  total: number
  migrated: number
  skipped: number
  errors: number
}

async function migratePreviewToCDN() {
  console.log('🚀 Начинаем миграцию превью в Cloudinary...\n')

  const stats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0
  }

  try {
    // Находим лид-магниты с base64 превью но без previewUrls
    const leadMagnets = await prisma.$queryRaw<Array<{
      id: string
      title: string
      previewImage: string | null
    }>>`
      SELECT id, title, "previewImage"
      FROM "LeadMagnet"
      WHERE "previewImage" IS NOT NULL
        AND "previewUrls" IS NULL
    `

    stats.total = leadMagnets.length
    console.log(`📊 Найдено лид-магнитов для миграции: ${stats.total}\n`)

    if (stats.total === 0) {
      console.log('✅ Нет лид-магнитов для миграции')
      return
    }

    for (const leadMagnet of leadMagnets) {
      console.log(`⚙️  Обрабатываем: ${leadMagnet.title}`)

      try {
        // Проверяем что это действительно base64
        if (!leadMagnet.previewImage?.startsWith('data:image')) {
          console.log('   ⏭️  Пропускаем - не base64 формат')
          stats.skipped++
          console.log('')
          continue
        }

        // Загружаем в Cloudinary с responsive размерами
        console.log('   📤 Загрузка в Cloudinary...')
        const uploadResult = await uploadPreviewFromDataUrl(
          leadMagnet.previewImage,
          leadMagnet.id
        )

        // Обновляем БД используя raw SQL для JSON поля
        await prisma.$executeRaw`
          UPDATE "LeadMagnet"
          SET "previewUrls" = ${JSON.stringify(uploadResult)}::jsonb
          WHERE id = ${leadMagnet.id}
        `

        console.log('   ✅ Успешно мигрировано')
        console.log(`      - Thumbnail: ${uploadResult.thumbnail}`)
        console.log(`      - Card: ${uploadResult.card}`)
        console.log(`      - Detail: ${uploadResult.detail}`)
        
        stats.migrated++

      } catch (error) {
        console.error('   ❌ Ошибка миграции:', error)
        stats.errors++
      }

      console.log('')

      // Задержка между запросами (rate limiting)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('\n📊 Итоговая статистика миграции:')
    console.log(`   📄 Всего: ${stats.total}`)
    console.log(`   ✅ Успешно: ${stats.migrated}`)
    console.log(`   ⏭️  Пропущено: ${stats.skipped}`)
    console.log(`   ❌ Ошибок: ${stats.errors}`)

    if (stats.migrated > 0) {
      console.log('\n💡 Совет: Старые base64 превью сохранены в previewImage для возможного rollback')
      console.log('   После проверки можно удалить их командой: UPDATE "LeadMagnet" SET "previewImage" = NULL WHERE "previewUrls" IS NOT NULL')
    }

  } catch (error) {
    console.error('❌ Критическая ошибка миграции:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запуск
migratePreviewToCDN()
  .then(() => {
    console.log('\n🎉 Миграция завершена!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Миграция провалена:', error)
    process.exit(1)
  })

