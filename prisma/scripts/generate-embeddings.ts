/**
 * Скрипт для генерации embeddings для всех специалистов
 * Запуск: tsx prisma/generate-embeddings.ts
 */

import { generateAllEmbeddings } from '../../src/lib/ai/embeddings'

async function main() {
  console.log('🚀 Starting embeddings generation...\n')

  try {
    const result = await generateAllEmbeddings()

    console.log('\n✅ Embeddings generation completed!')
    console.log(`📊 Statistics:`)
    console.log(`   - Total specialists: ${result.total}`)
    console.log(`   - Successfully generated: ${result.successCount}`)
    console.log(`   - Errors: ${result.errorCount}`)

    if (result.errorCount > 0) {
      console.warn('\n⚠️  Some embeddings failed. Check logs above for details.')
      process.exit(1)
    }

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

main()

