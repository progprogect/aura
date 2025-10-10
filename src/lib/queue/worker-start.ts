/**
 * Entry point для запуска preview worker
 * Использовать: npx ts-node src/lib/queue/worker-start.ts
 * Для production: добавить в package.json scripts
 */

import { createPreviewWorker } from './preview-worker'

console.log('🚀 Запуск Preview Worker...')

const worker = createPreviewWorker()

if (!worker) {
  console.error('❌ Не удалось запустить worker - проверьте настройки Redis')
  process.exit(1)
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Получен сигнал SIGTERM, останавливаем worker...')
  await worker.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('Получен сигнал SIGINT, останавливаем worker...')
  await worker.close()
  process.exit(0)
})

console.log('✅ Preview Worker работает')
console.log('Для остановки нажмите Ctrl+C')

