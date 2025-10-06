const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:AEXabgipqvhbLSwunyuZfLBgwtZsgHjg@hopper.proxy.rlwy.net:40277/railway"
    }
  }
})

// Функция для транслитерации кириллицы в латиницу
function transliterate(text) {
  const cyrillic = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  }
  
  return text
    .toLowerCase()
    .split('')
    .map(char => cyrillic[char] || char)
    .join('')
}

// Функция для создания slug'а
function createSlug(firstName, lastName, category, id) {
  const transliteratedFirst = transliterate(firstName)
  const transliteratedLast = transliterate(lastName)
  
  // Убираем все не-латинские символы и цифры, заменяем пробелы на дефисы
  const cleanFirst = transliteratedFirst.replace(/[^a-z]/g, '').replace(/\s+/g, '-')
  const cleanLast = transliteratedLast.replace(/[^a-z]/g, '').replace(/\s+/g, '-')
  
  return `${cleanFirst}-${cleanLast}-${category}-${id}`
}

async function fixSlugs() {
  try {
    console.log('🔧 Исправляем slug\'ы специалистов...')
    
    const specialists = await prisma.specialist.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        category: true,
        slug: true
      }
    })
    
    console.log(`📊 Найдено специалистов: ${specialists.length}`)
    
    let updated = 0
    let errors = 0
    
    for (const specialist of specialists) {
      try {
        const newSlug = createSlug(
          specialist.firstName,
          specialist.lastName,
          specialist.category,
          specialist.id.substring(specialist.id.length - 4) // Последние 4 символа ID
        )
        
        console.log(`🔄 ${specialist.firstName} ${specialist.lastName}`)
        console.log(`   Старый: "${specialist.slug}"`)
        console.log(`   Новый: "${newSlug}"`)
        
        await prisma.specialist.update({
          where: { id: specialist.id },
          data: { slug: newSlug }
        })
        
        console.log(`   ✅ Обновлен`)
        updated++
        
      } catch (error) {
        console.log(`   ❌ Ошибка: ${error.message}`)
        errors++
      }
      
      console.log('')
    }
    
    console.log(`📊 Результаты:`)
    console.log(`   - Обновлено: ${updated}`)
    console.log(`   - Ошибок: ${errors}`)
    
    if (updated > 0) {
      console.log('\n🎉 Slug\'ы исправлены!')
      console.log('✅ Теперь все slug\'ы содержат только латинские символы')
      console.log('✅ Страницы специалистов должны работать корректно')
    }
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixSlugs()
