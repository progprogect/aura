/**
 * Worker для обработки задач генерации превью
 * Выполняется как отдельный процесс или в фоновом режиме
 */

import { Worker, Job } from 'bullmq'
import { redisConnection, isRedisConfigured } from './config'
import { PreviewJobData, GeneratePreviewJobData, BatchGenerateJobData } from './preview-queue'
import { generatePreview } from '../lead-magnets/preview/core/generator'
import { uploadPreviewToCloudinary } from '../lead-magnets/preview/storage/cloudinary.storage'
import { prisma } from '../db'

/**
 * Обработчик задачи генерации превью
 */
async function processGeneratePreview(
  job: Job<GeneratePreviewJobData>
): Promise<void> {
  const { leadMagnetId, type, fileUrl, linkUrl, ogImage, title, description, emoji, highlights } = job.data

  console.log(`[Preview Worker] Обработка превью для: ${title}`)
  
  try {
    // Обновляем прогресс
    await job.updateProgress(10)

    // Генерируем превью используя новую архитектуру
    const result = await generatePreview({
      type,
      fileUrl,
      linkUrl,
      ogImage,
      title,
      description,
      emoji,
      highlights
    })

    await job.updateProgress(40)

    if (!result.success || !result.previewBuffer) {
      throw new Error(result.error || 'Не удалось сгенерировать превью')
    }

    // Загружаем в Cloudinary с responsive размерами
    const uploadResult = await uploadPreviewToCloudinary(
      result.previewBuffer,
      leadMagnetId
    )

    await job.updateProgress(80)

    // Сохраняем URLs в БД
    await prisma.leadMagnet.update({
      where: { id: leadMagnetId },
      data: {
        previewUrls: uploadResult.urls as any, // JSON поле
        previewImage: uploadResult.urls.card, // Для обратной совместимости
      }
    })

    await job.updateProgress(100)

    console.log(`[Preview Worker] ✅ Превью сгенерировано и загружено для: ${title}`)
  } catch (error) {
    console.error(`[Preview Worker] ❌ Ошибка генерации превью для ${title}:`, error)
    throw error
  }
}

/**
 * Обработчик батч-задачи
 */
async function processBatchGenerate(
  job: Job<BatchGenerateJobData>
): Promise<void> {
  const { leadMagnetIds } = job.data

  console.log(`[Preview Worker] Батч-обработка ${leadMagnetIds.length} лид-магнитов`)

  let processed = 0
  let errors = 0

  for (const leadMagnetId of leadMagnetIds) {
    try {
      // Получаем лид-магнит из БД
      const leadMagnet = await prisma.leadMagnet.findUnique({
        where: { id: leadMagnetId }
      })

      if (!leadMagnet) {
        console.warn(`[Preview Worker] Лид-магнит ${leadMagnetId} не найден`)
        errors++
        continue
      }

      // Генерируем превью используя новую архитектуру
      const result = await generatePreview({
        type: leadMagnet.type as 'file' | 'link' | 'service',
        fileUrl: leadMagnet.fileUrl,
        linkUrl: leadMagnet.linkUrl,
        ogImage: leadMagnet.ogImage,
        title: leadMagnet.title,
        description: leadMagnet.description,
        emoji: leadMagnet.emoji,
        highlights: leadMagnet.highlights
      })

      if (result.success && result.previewBuffer) {
        // Загружаем в Cloudinary
        const uploadResult = await uploadPreviewToCloudinary(
          result.previewBuffer,
          leadMagnetId
        )

        await prisma.leadMagnet.update({
          where: { id: leadMagnetId },
          data: {
            previewUrls: uploadResult.urls as any,
            previewImage: uploadResult.urls.card,
          }
        })

        processed++
      } else {
        errors++
      }

      // Обновляем прогресс
      const progress = Math.floor((processed + errors) / leadMagnetIds.length * 100)
      await job.updateProgress(progress)

      // Задержка между запросами для предотвращения rate limits
      await new Promise(resolve => setTimeout(resolve, 500))

    } catch (error) {
      console.error(`[Preview Worker] Ошибка обработки ${leadMagnetId}:`, error)
      errors++
    }
  }

  console.log(`[Preview Worker] Батч завершён: ${processed} успешно, ${errors} ошибок`)
}

/**
 * Главный обработчик задач
 */
async function processJob(job: Job<PreviewJobData>): Promise<void> {
  console.log(`[Preview Worker] Начало обработки задачи: ${job.name} (${job.id})`)

  switch (job.name) {
    case 'generate-preview':
    case 'regenerate-preview':
      await processGeneratePreview(job as Job<GeneratePreviewJobData>)
      break

    case 'batch-generate':
      await processBatchGenerate(job as Job<BatchGenerateJobData>)
      break

    default:
      console.warn(`[Preview Worker] Неизвестный тип задачи: ${job.name}`)
  }
}

/**
 * Создать и запустить worker
 */
export function createPreviewWorker(): Worker<PreviewJobData> | null {
  if (!isRedisConfigured()) {
    console.warn('[Preview Worker] Redis не настроен, worker не запущен')
    return null
  }

  const worker = new Worker<PreviewJobData>(
    'preview-generation',
    processJob,
    {
      connection: redisConnection,
      concurrency: 2, // Обрабатываем 2 задачи параллельно
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 1000 },
    }
  )

  // Обработка событий worker
  worker.on('completed', (job) => {
    console.log(`[Preview Worker] ✅ Задача ${job.id} завершена`)
  })

  worker.on('failed', (job, err) => {
    console.error(`[Preview Worker] ❌ Задача ${job?.id} провалена:`, err)
  })

  worker.on('error', (err) => {
    console.error('[Preview Worker] ❌ Ошибка worker:', err)
  })

  worker.on('stalled', (jobId) => {
    console.warn(`[Preview Worker] ⚠️ Задача ${jobId} застряла`)
  })

  console.log('[Preview Worker] 🚀 Worker запущен')

  return worker
}

/**
 * Graceful shutdown worker
 */
export async function shutdownWorker(worker: Worker): Promise<void> {
  console.log('[Preview Worker] Остановка worker...')
  await worker.close()
  console.log('[Preview Worker] Worker остановлен')
}

