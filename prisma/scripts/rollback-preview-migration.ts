/**
 * Скрипт rollback миграции превью
 * 
 * Откатывает изменения, восстанавливая base64 превью
 * 
 * Использование: npx ts-node prisma/scripts/rollback-preview-migration.ts
 */

import { PrismaClient } from '@prisma/client'
import { deletePreview } from '../../src/lib/cloudinary/preview-uploader'

const prisma = new PrismaClient()

async function rollbackMigration() {
  console.log('🔄 Начинаем откат миграции превью...\n')

  try {
    // Находим лид-магниты с previewUrls и сохранённым previewImage (backup)
    const leadMagnets = await prisma.$queryRaw<Array<{
      id: string
      title: string
      previewImage: string | null
      previewUrls: any
    }>>`
      SELECT id, title, "previewImage", "previewUrls"
      FROM "LeadMagnet"
      WHERE "previewUrls" IS NOT NULL
        AND "previewImage" IS NOT NULL
    `

    console.log(`📊 Найдено лид-магнитов для отката: ${leadMagnets.length}\n`)

    if (leadMagnets.length === 0) {
      console.log('✅ Нет лид-магнитов для отката')
      return
    }

    let rolledBack = 0
    let errors = 0

    for (const leadMagnet of leadMagnets) {
      console.log(`⚙️  Откатываем: ${leadMagnet.title}`)

      try {
        // Удаляем из Cloudinary
        try {
          await deletePreview(leadMagnet.id)
          console.log('   🗑️  Превью удалено из Cloudinary')
        } catch (error) {
          console.warn('   ⚠️  Не удалось удалить из Cloudinary:', error)
        }

        // Восстанавливаем в БД (удаляем previewUrls)
        await prisma.$executeRaw`
          UPDATE "LeadMagnet" 
          SET "previewUrls" = NULL 
          WHERE "id" = ${leadMagnet.id}
        `

        console.log('   ✅ Откат выполнен')
        rolledBack++

      } catch (error) {
        console.error('   ❌ Ошибка отката:', error)
        errors++
      }

      console.log('')
    }

    console.log('\n📊 Итоговая статистика отката:')
    console.log(`   📄 Всего: ${leadMagnets.length}`)
    console.log(`   ✅ Успешно: ${rolledBack}`)
    console.log(`   ❌ Ошибок: ${errors}`)

  } catch (error) {
    console.error('❌ Критическая ошибка отката:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запуск
rollbackMigration()
  .then(() => {
    console.log('\n🎉 Откат завершён!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Откат провален:', error)
    process.exit(1)
  })

