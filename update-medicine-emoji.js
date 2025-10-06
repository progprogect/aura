const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:AEXabgipqvhbLSwunyuZfLBgwtZsgHjg@hopper.proxy.rlwy.net:40277/railway"
    }
  }
})

async function updateMedicineEmoji() {
  try {
    console.log('🔧 Обновляем эмодзи для медицинской категории...')
    
    // Варианты эмодзи для медицины
    const emojiOptions = [
      '🩺', // стетоскоп
      '👨‍⚕️', // врач мужчина
      '👩‍⚕️', // врач женщина
      '🏥', // больница
      '💊', // таблетки
      '🩹', // пластырь
      '🧑‍⚕️', // медицинский работник (нейтральный)
    ]
    
    console.log('📋 Доступные варианты эмодзи для медицины:')
    emojiOptions.forEach((emoji, index) => {
      console.log(`${index + 1}. ${emoji}`)
    })
    
    // Выбираем стетоскоп как наиболее подходящий
    const newEmoji = '🩺'
    
    console.log(`\n🔄 Обновляем эмодзи с "⚕️" на "${newEmoji}"...`)
    
    const result = await prisma.category.update({
      where: { key: 'medicine' },
      data: { emoji: newEmoji }
    })
    
    console.log('✅ Эмодзи обновлено!')
    console.log(`   Категория: ${result.name}`)
    console.log(`   Новое эмодзи: "${result.emoji}"`)
    
    // Проверяем результат
    const updated = await prisma.category.findUnique({
      where: { key: 'medicine' },
      select: { key: true, name: true, emoji: true }
    })
    
    console.log('\n📊 Результат:')
    console.log(`   Ключ: ${updated.key}`)
    console.log(`   Название: ${updated.name}`)
    console.log(`   Эмодзи: "${updated.emoji}"`)
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

updateMedicineEmoji()
