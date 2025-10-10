/**
 * Скрипт миграции: Исправление 401 ошибок для существующих PDF файлов
 * 
 * Проблема: PDF файлы были загружены без resource_type: 'raw' и имеют ограниченный доступ
 * Решение: Перезагружаем PDF с правильными настройками в Cloudinary
 * 
 * Использование: npx ts-node prisma/scripts/fix-pdf-access.ts
 */

import { PrismaClient } from '@prisma/client'
import { uploadPDF } from '../../src/lib/cloudinary/config'

const prisma = new PrismaClient()

async function fixPDFAccess() {
  console.log('🔧 Начинаем исправление доступа к PDF файлам...\n')

  try {
    // Находим все лид-магниты типа 'file' с PDF файлами
    const leadMagnets = await prisma.leadMagnet.findMany({
      where: {
        type: 'file',
        fileUrl: {
          contains: '.pdf'
        }
      },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        specialistProfileId: true
      }
    })

    console.log(`📄 Найдено PDF файлов: ${leadMagnets.length}\n`)

    if (leadMagnets.length === 0) {
      console.log('✅ PDF файлы не найдены или уже исправлены')
      return
    }

    let successCount = 0
    let errorCount = 0

    for (const leadMagnet of leadMagnets) {
      console.log(`⚙️  Обрабатываем: ${leadMagnet.title}`)
      console.log(`   URL: ${leadMagnet.fileUrl}`)

      try {
        // Проверяем доступность текущего файла
        const checkResponse = await fetch(leadMagnet.fileUrl!)
        
        if (checkResponse.status === 401) {
          console.log('   ❌ 401 Unauthorized - требуется исправление')
          
          // Скачиваем файл
          const arrayBuffer = await checkResponse.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const base64 = `data:application/pdf;base64,${buffer.toString('base64')}`

          // Перезагружаем с правильными настройками
          const uploadResult = await uploadPDF(
            base64,
            'lead-magnets',
            `pdf_${leadMagnet.specialistProfileId}_${leadMagnet.id}`
          )

          // Обновляем URL в БД
          await prisma.leadMagnet.update({
            where: { id: leadMagnet.id },
            data: { fileUrl: uploadResult.url }
          })

          console.log(`   ✅ Исправлено! Новый URL: ${uploadResult.url}`)
          successCount++
        } else if (checkResponse.status === 200) {
          console.log('   ✅ Файл доступен, исправление не требуется')
          successCount++
        } else {
          console.log(`   ⚠️  Неожиданный статус: ${checkResponse.status}`)
          errorCount++
        }
      } catch (error) {
        console.error(`   ❌ Ошибка обработки:`, error)
        errorCount++
      }

      console.log('') // Пустая строка для читаемости
    }

    console.log('\n📊 Результаты миграции:')
    console.log(`   ✅ Успешно: ${successCount}`)
    console.log(`   ❌ Ошибки: ${errorCount}`)
    console.log(`   📄 Всего: ${leadMagnets.length}`)

  } catch (error) {
    console.error('❌ Критическая ошибка миграции:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запуск скрипта
fixPDFAccess()
  .then(() => {
    console.log('\n🎉 Миграция завершена!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Миграция провалена:', error)
    process.exit(1)
  })

