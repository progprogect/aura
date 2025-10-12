/**
 * Скрипт миграции превью лид-магнитов
 * Заменяет все существующие превью на fallback (emoji + градиент)
 * 
 * Usage:
 *   npx tsx scripts/migrate-lead-magnet-previews.ts --dry-run  # Тестовый прогон
 *   npx tsx scripts/migrate-lead-magnet-previews.ts            # Реальная миграция
 */

import { prisma } from '../src/lib/db'
import { generateFallbackPreview } from '../src/lib/lead-magnets/fallback-preview-generator'
import { uploadFallbackPreview } from '../src/lib/cloudinary/config'
import type { LeadMagnetType } from '../src/types/lead-magnet'

interface MigrationResult {
  id: string
  title: string
  type: string
  success: boolean
  error?: string
}

async function migrateLeadMagnetPreviews(dryRun: boolean = false) {
  console.log('🔄 Начало миграции превью лид-магнитов')
  console.log(`📊 Режим: ${dryRun ? 'DRY RUN (без изменений)' : 'РЕАЛЬНАЯ МИГРАЦИЯ'}`)
  console.log('─'.repeat(60))

  try {
    // Получаем все активные лид-магниты
    const leadMagnets = await prisma.leadMagnet.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        title: true,
        type: true,
        emoji: true,
        previewUrls: true
      }
    })

    console.log(`📦 Найдено лид-магнитов: ${leadMagnets.length}`)
    console.log('─'.repeat(60))

    const results: MigrationResult[] = []
    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (let i = 0; i < leadMagnets.length; i++) {
      const magnet = leadMagnets[i]
      const progress = `[${i + 1}/${leadMagnets.length}]`

      console.log(`\n${progress} Обработка: "${magnet.title}"`)
      console.log(`  Type: ${magnet.type}`)
      console.log(`  Emoji: ${magnet.emoji}`)
      console.log(`  Existing previewUrls: ${magnet.previewUrls ? 'Да' : 'Нет'}`)

      try {
        // Генерируем fallback превью
        console.log(`  🎨 Генерация fallback превью...`)
        const fallbackResult = await generateFallbackPreview({
          type: magnet.type as LeadMagnetType,
          emoji: magnet.emoji
        })

        if (!dryRun) {
          // Загружаем в Cloudinary
          console.log(`  ☁️  Загрузка в Cloudinary...`)
          const uploadResult = await uploadFallbackPreview(fallbackResult.buffer, magnet.id)

          const previewUrls = {
            thumbnail: uploadResult.thumbnail,
            card: uploadResult.card,
            detail: uploadResult.detail
          }

          // Обновляем в БД
          await prisma.leadMagnet.update({
            where: { id: magnet.id },
            data: { previewUrls: previewUrls as any }
          })

          console.log(`  ✅ Успешно обновлено`)
          console.log(`  🔗 Preview URLs:`)
          console.log(`     - Card: ${previewUrls.card}`)
          successCount++
        } else {
          console.log(`  ✅ (DRY RUN) Будет обновлено`)
          successCount++
        }

        results.push({
          id: magnet.id,
          title: magnet.title,
          type: magnet.type,
          success: true
        })

      } catch (error) {
        console.log(`  ❌ Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`)
        errorCount++
        results.push({
          id: magnet.id,
          title: magnet.title,
          type: magnet.type,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 ИТОГИ МИГРАЦИИ')
    console.log('='.repeat(60))
    console.log(`✅ Успешно:    ${successCount}`)
    console.log(`❌ Ошибки:     ${errorCount}`)
    console.log(`📦 Всего:      ${leadMagnets.length}`)
    console.log('='.repeat(60))

    if (errorCount > 0) {
      console.log('\n❌ Лид-магниты с ошибками:')
      results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.title} (${r.id})`)
          console.log(`    Ошибка: ${r.error}`)
        })
    }

    if (dryRun) {
      console.log('\n💡 Это был DRY RUN. Для реальной миграции запустите без --dry-run')
    } else {
      console.log('\n✅ Миграция завершена успешно!')
    }

    return {
      total: leadMagnets.length,
      success: successCount,
      errors: errorCount,
      results
    }

  } catch (error) {
    console.error('\n❌ Критическая ошибка миграции:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запуск скрипта
const dryRun = process.argv.includes('--dry-run')

migrateLeadMagnetPreviews(dryRun)
  .then((result) => {
    process.exit(result.errors > 0 ? 1 : 0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

