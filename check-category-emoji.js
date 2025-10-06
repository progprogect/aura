const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:AEXabgipqvhbLSwunyuZfLBgwtZsgHjg@hopper.proxy.rlwy.net:40277/railway"
    }
  }
})

async function checkCategoryEmoji() {
  try {
    console.log('🔍 Проверяем эмодзи категорий...')
    
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        key: true,
        name: true,
        emoji: true,
        isActive: true
      }
    })
    
    console.log(`📊 Найдено категорий: ${categories.length}`)
    console.log('\n📂 Категории и их эмодзи:')
    
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.key})`)
      console.log(`   Эмодзи: "${category.emoji}"`)
      console.log(`   Активна: ${category.isActive ? '✅' : '❌'}`)
      console.log('')
    })
    
    // Проверяем конкретно медицину
    const medicine = categories.find(c => c.key === 'medicine')
    if (medicine) {
      console.log('🏥 Медицинская категория:')
      console.log(`   Название: ${medicine.name}`)
      console.log(`   Эмодзи: "${medicine.emoji}"`)
      console.log(`   Активна: ${medicine.isActive ? '✅' : '❌'}`)
    } else {
      console.log('❌ Медицинская категория не найдена!')
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkCategoryEmoji()
