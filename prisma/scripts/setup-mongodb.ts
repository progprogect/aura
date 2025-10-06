/**
 * Скрипт для инициализации MongoDB (создание индексов)
 * Запуск: tsx prisma/setup-mongodb.ts
 */

import { createIndexes } from '../../src/lib/ai/mongodb-client'

async function main() {
  console.log('🗄️  Setting up MongoDB...\n')

  try {
    await createIndexes()
    console.log('\n✅ MongoDB setup completed!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

main()

