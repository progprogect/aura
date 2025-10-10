/**
 * Исправление access control для файлов в Cloudinary через API
 * 
 * Использует Cloudinary explicit() для изменения resource_type и access_mode
 * без повторной загрузки файла
 * 
 * Использование: npx tsx prisma/scripts/fix-cloudinary-access-control.ts
 */

import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

/**
 * Извлечь public_id из Cloudinary URL
 */
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // https://res.cloudinary.com/cloud/image/upload/v123/aura/lead-magnets/file.pdf
    // Нужно: aura/lead-magnets/file
    const match = url.match(/\/(?:image|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?(?:\?|$)/)
    if (match && match[1]) {
      return match[1]
    }
    return null
  } catch {
    return null
  }
}

/**
 * Исправить resource_type через Cloudinary API
 */
async function fixResourceType(publicId: string, filename: string): Promise<string | null> {
  try {
    console.log(`   🔄 Попытка изменить resource_type через API...`)
    
    // Метод 1: explicit - создаёт новую версию с правильными параметрами
    const result = await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      resource_type: 'raw',
      invalidate: true
    })
    
    console.log(`   ✅ Resource type изменён через explicit`)
    return result.secure_url

  } catch (error: any) {
    console.log(`   ⚠️  Explicit не сработал: ${error.message}`)
    
    // Метод 2: Попробовать rename (иногда работает)
    try {
      console.log(`   🔄 Попытка через rename...`)
      const newPublicId = `${publicId}_fixed`
      
      await cloudinary.uploader.rename(publicId, newPublicId, {
        resource_type: 'image', // Старый тип
        to_type: 'upload',
        invalidate: true
      })
      
      // Теперь загружаем как raw с тем же именем
      const uploadResult = await cloudinary.uploader.upload(
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${newPublicId}.${filename.split('.').pop()}`,
        {
          public_id: publicId,
          resource_type: 'raw',
          type: 'upload',
          access_mode: 'public',
          overwrite: true,
          invalidate: true
        }
      )
      
      // Удаляем временный файл
      await cloudinary.uploader.destroy(newPublicId, { resource_type: 'image' })
      
      console.log(`   ✅ Исправлено через rename`)
      return uploadResult.secure_url
      
    } catch (renameError: any) {
      console.log(`   ⚠️  Rename не сработал: ${renameError.message}`)
      return null
    }
  }
}

async function fixCloudinaryAccessControl() {
  console.log('🔧 Исправление access control через Cloudinary API...\n')

  // Настройка Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  })

  try {
    // Находим файлы с неправильным URL через raw SQL
    const leadMagnets = await prisma.$queryRaw<Array<{
      id: string
      title: string
      fileUrl: string | null
    }>>`
      SELECT id, title, "fileUrl"
      FROM "LeadMagnet"
      WHERE type = 'file'
        AND "fileUrl" LIKE '%/image/upload/%'
        AND ("fileUrl" LIKE '%.pdf' OR "fileUrl" LIKE '%.doc%' OR "fileUrl" LIKE '%.zip')
    `

    console.log(`📊 Найдено PDF с неправильным resource_type: ${leadMagnets.length}\n`)

    if (leadMagnets.length === 0) {
      console.log('✅ Все файлы имеют правильный resource_type')
      return
    }

    let fixed = 0
    let errors = 0

    for (const lm of leadMagnets) {
      console.log(`\n⚙️  ${lm.title}`)
      console.log(`   Старый URL: ${lm.fileUrl}`)

      try {
        const publicId = extractPublicIdFromUrl(lm.fileUrl!)
        
        if (!publicId) {
          console.error('   ❌ Не удалось извлечь public_id из URL')
          errors++
          continue
        }

        console.log(`   Public ID: ${publicId}`)

        const newUrl = await fixResourceType(publicId, lm.title)

        if (newUrl) {
          // Обновляем URL в БД
          await prisma.leadMagnet.update({
            where: { id: lm.id },
            data: { fileUrl: newUrl }
          })

          console.log(`   ✅ ИСПРАВЛЕНО!`)
          console.log(`   Новый URL: ${newUrl}`)
          
          if (!newUrl.includes('/raw/upload/')) {
            console.warn('   ⚠️  WARNING: URL всё ещё не содержит /raw/upload/')
          }

          fixed++
        } else {
          console.error('   ❌ Не удалось исправить через API')
          errors++
        }

        await new Promise(r => setTimeout(r, 1000))

      } catch (error) {
        console.error('   ❌ Ошибка:', error)
        errors++
      }
    }

    console.log('\n\n📊 Итоговая статистика:')
    console.log(`   📄 Всего: ${leadMagnets.length}`)
    console.log(`   ✅ Исправлено: ${fixed}`)
    console.log(`   ❌ Ошибок: ${errors}`)

  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запуск
fixCloudinaryAccessControl()
  .then(() => {
    console.log('\n✅ Скрипт завершён!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Скрипт провален:', error)
    process.exit(1)
  })

