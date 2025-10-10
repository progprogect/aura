/**
 * Универсальный скрипт исправления Cloudinary URLs
 * 
 * Находит ВСЕ файлы с неправильным resource_type и перезагружает их
 * 
 * Проблема: Файлы (PDF, DOC, etc) загружены как image/upload вместо raw/upload
 * Решение: Скачать → Удалить → Загрузить заново с правильными параметрами
 * 
 * Использование: npx tsx prisma/scripts/fix-all-cloudinary-urls.ts
 */

import { PrismaClient } from '@prisma/client'
import { uploadPDF, uploadDocument } from '../../src/lib/cloudinary/config'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

interface FixStats {
  total: number
  fixed: number
  alreadyCorrect: number
  errors: number
}

/**
 * Проверить является ли URL неправильным (image вместо raw)
 */
function isWrongResourceType(url: string): boolean {
  return url.includes('/image/upload/') && (
    url.endsWith('.pdf') ||
    url.endsWith('.doc') ||
    url.endsWith('.docx') ||
    url.endsWith('.zip') ||
    url.endsWith('.rar')
  )
}

/**
 * Определить тип файла по URL
 */
function getFileType(url: string): 'pdf' | 'document' | 'unknown' {
  if (url.endsWith('.pdf')) return 'pdf'
  if (url.endsWith('.doc') || url.endsWith('.docx') || url.endsWith('.txt')) return 'document'
  return 'unknown'
}

/**
 * Извлечь public_id из Cloudinary URL
 */
function extractPublicId(url: string): string | null {
  try {
    // Пример: https://res.cloudinary.com/cloud/image/upload/v123/folder/file.pdf
    // Нужно: folder/file (без расширения)
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/)
    if (match && match[1]) {
      // Убираем расширение
      return match[1].replace(/\.[^.]+$/, '')
    }
    return null
  } catch {
    return null
  }
}

async function fixAllCloudinaryURLs() {
  console.log('🔧 Универсальный fixer для Cloudinary URLs...\n')

  const stats: FixStats = {
    total: 0,
    fixed: 0,
    alreadyCorrect: 0,
    errors: 0
  }

  try {
    // Находим ВСЕ лид-магниты с fileUrl
    const leadMagnets = await prisma.leadMagnet.findMany({
      where: {
        type: 'file',
        fileUrl: { not: null }
      },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        specialistProfileId: true
      }
    })

    stats.total = leadMagnets.length
    console.log(`📊 Найдено файлов для проверки: ${stats.total}\n`)

    if (stats.total === 0) {
      console.log('✅ Нет файлов для проверки')
      return
    }

    for (const leadMagnet of leadMagnets) {
      console.log(`\n⚙️  ${leadMagnet.title}`)
      console.log(`   URL: ${leadMagnet.fileUrl}`)

      try {
        // Проверяем является ли URL неправильным
        if (!isWrongResourceType(leadMagnet.fileUrl!)) {
          console.log('   ✅ URL правильный (raw/upload или не документ)')
          stats.alreadyCorrect++
          continue
        }

        console.log('   🔴 НЕПРАВИЛЬНЫЙ URL - требуется исправление!')

        const fileType = getFileType(leadMagnet.fileUrl!)
        console.log(`   Тип файла: ${fileType}`)

        // Скачиваем файл
        console.log('   📥 Скачивание файла...')
        const response = await fetch(leadMagnet.fileUrl!)
        
        if (!response.ok) {
          throw new Error(`Не удалось скачать файл: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const mimeType = fileType === 'pdf' ? 'application/pdf' : 'application/octet-stream'
        const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`

        // Удаляем старый файл из Cloudinary (если можем)
        const publicId = extractPublicId(leadMagnet.fileUrl!)
        if (publicId) {
          try {
            console.log(`   🗑️  Удаление старого файла (${publicId})...`)
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
          } catch (error) {
            console.warn('   ⚠️  Не удалось удалить старый файл (не критично)')
          }
        }

        // Загружаем заново с правильными параметрами
        console.log('   📤 Загрузка с правильными параметрами...')
        const uploadResult = fileType === 'pdf'
          ? await uploadPDF(base64, 'lead-magnets', `pdf_${leadMagnet.specialistProfileId}_${leadMagnet.id}`)
          : await uploadDocument(base64, 'lead-magnets', `doc_${leadMagnet.specialistProfileId}_${leadMagnet.id}`)

        // Обновляем URL в БД
        await prisma.leadMagnet.update({
          where: { id: leadMagnet.id },
          data: { fileUrl: uploadResult.url }
        })

        console.log(`   ✅ ИСПРАВЛЕНО!`)
        console.log(`   Новый URL: ${uploadResult.url}`)
        
        // Проверяем что новый URL правильный
        if (!uploadResult.url.includes('/raw/upload/')) {
          console.warn('   ⚠️  WARNING: Новый URL всё ещё не /raw/upload/!')
        }

        stats.fixed++

        // Задержка для rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`   ❌ Ошибка исправления:`, error)
        stats.errors++
      }
    }

    console.log('\n\n📊 Итоговая статистика:')
    console.log(`   📄 Всего проверено: ${stats.total}`)
    console.log(`   ✅ Исправлено: ${stats.fixed}`)
    console.log(`   ✅ Уже правильные: ${stats.alreadyCorrect}`)
    console.log(`   ❌ Ошибок: ${stats.errors}`)

    if (stats.fixed > 0) {
      console.log('\n🎉 Все файлы исправлены! Теперь они доступны публично.')
    }

  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запуск
fixAllCloudinaryURLs()
  .then(() => {
    console.log('\n✅ Скрипт завершён!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Скрипт провален:', error)
    process.exit(1)
  })

