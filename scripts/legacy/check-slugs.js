const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:AEXabgipqvhbLSwunyuZfLBgwtZsgHjg@hopper.proxy.rlwy.net:40277/railway"
    }
  }
})

async function checkSlugs() {
  try {
    console.log('🔍 Проверяем slug\'ы специалистов...')
    
    const specialists = await prisma.specialist.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        slug: true,
        category: true
      }
    })
    
    console.log(`📊 Найдено специалистов: ${specialists.length}`)
    console.log('\n👥 Slug\'ы специалистов:')
    
    specialists.forEach((spec, index) => {
      console.log(`${index + 1}. ${spec.firstName} ${spec.lastName} (${spec.category})`)
      console.log(`   Slug: "${spec.slug}"`)
      console.log(`   URL: /specialist/${spec.slug}`)
      console.log('')
    })
    
    // Проверяем уникальность
    const slugs = specialists.map(s => s.slug)
    const uniqueSlugs = [...new Set(slugs)]
    
    if (slugs.length === uniqueSlugs.length) {
      console.log('✅ Все slug\'ы уникальны')
    } else {
      console.log(`⚠️ Найдены дублирующиеся slug\'ы: ${slugs.length - uniqueSlugs.length}`)
    }
    
    // Проверяем формат slug'ов
    const invalidSlugs = slugs.filter(slug => {
      return !/^[a-z0-9-]+$/.test(slug) || slug.includes(' ') || slug.startsWith('-') || slug.endsWith('-')
    })
    
    if (invalidSlugs.length === 0) {
      console.log('✅ Все slug\'ы в правильном формате')
    } else {
      console.log(`❌ Неправильные slug\'ы: ${invalidSlugs.length}`)
      invalidSlugs.forEach(slug => console.log(`   - "${slug}"`))
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkSlugs()
