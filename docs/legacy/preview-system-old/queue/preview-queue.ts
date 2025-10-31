/**
 * Очередь для генерации превью лид-магнитов
 */

import { Queue } from 'bullmq'
import { defaultQueueOptions, isRedisConfigured } from './config'

// Типы задач в очереди
export type PreviewJobType = 
  | 'generate-preview' 
  | 'regenerate-preview' 
  | 'batch-generate'

// Данные для задачи генерации превью
export interface GeneratePreviewJobData {
  leadMagnetId: string
  type: 'file' | 'link' | 'service'
  fileUrl?: string | null
  linkUrl?: string | null
  ogImage?: string | null
  title: string
  description: string
  emoji: string
  highlights?: string[]
}

// Данные для батч-генерации
export interface BatchGenerateJobData {
  leadMagnetIds: string[]
}

// Объединённый тип данных для всех типов задач
export type PreviewJobData = 
  | GeneratePreviewJobData 
  | BatchGenerateJobData

/**
 * Очередь для превью (singleton)
 */
let previewQueue: Queue<PreviewJobData> | null = null

/**
 * Получить или создать очередь превью
 */
export function getPreviewQueue(): Queue<PreviewJobData> | null {
  if (!isRedisConfigured()) {
    console.warn('[Preview Queue] Redis не настроен, очередь недоступна')
    return null
  }

  if (!previewQueue) {
    previewQueue = new Queue<PreviewJobData>('preview-generation', defaultQueueOptions)
    
    // Обработка событий очереди
    previewQueue.on('error', (error) => {
      console.error('[Preview Queue] Ошибка очереди:', error)
    })
    
    previewQueue.on('waiting', (jobId) => {
      console.log(`[Preview Queue] Задача ${jobId} ожидает обработки`)
    })
  }

  return previewQueue
}

/**
 * Добавить задачу генерации превью в очередь
 */
export async function addGeneratePreviewJob(
  data: GeneratePreviewJobData,
  priority: number = 0
): Promise<string | null> {
  const queue = getPreviewQueue()
  
  if (!queue) {
    console.warn('[Preview Queue] Очередь недоступна, пропускаем задачу')
    return null
  }

  try {
    const job = await queue.add('generate-preview', data, {
      priority, // Чем меньше число, тем выше приоритет
      jobId: `preview-${data.leadMagnetId}`, // Уникальный ID для дедупликации
      removeOnComplete: true,
      removeOnFail: false,
    })

    console.log(`[Preview Queue] Добавлена задача ${job.id} для лид-магнита "${data.title}"`)
    return job.id ?? null
  } catch (error) {
    console.error('[Preview Queue] Ошибка добавления задачи:', error)
    return null
  }
}

/**
 * Добавить задачу перегенерации превью
 */
export async function addRegeneratePreviewJob(
  data: GeneratePreviewJobData
): Promise<string | null> {
  const queue = getPreviewQueue()
  
  if (!queue) {
    return null
  }

  try {
    const job = await queue.add('regenerate-preview', data, {
      priority: 10, // Ниже приоритет чем у новых
      jobId: `regenerate-${data.leadMagnetId}`,
      removeOnComplete: true,
      removeOnFail: false,
    })

    console.log(`[Preview Queue] Добавлена задача перегенерации ${job.id}`)
    return job.id ?? null
  } catch (error) {
    console.error('[Preview Queue] Ошибка добавления задачи перегенерации:', error)
    return null
  }
}

/**
 * Добавить батч-задачу для массовой генерации
 */
export async function addBatchGenerateJob(
  leadMagnetIds: string[]
): Promise<string | null> {
  const queue = getPreviewQueue()
  
  if (!queue) {
    return null
  }

  try {
    const job = await queue.add('batch-generate', { leadMagnetIds }, {
      priority: 100, // Низкий приоритет для батч-задач
      removeOnComplete: true,
      removeOnFail: false,
    })

    console.log(`[Preview Queue] Добавлена батч-задача ${job.id} для ${leadMagnetIds.length} лид-магнитов`)
    return job.id ?? null
  } catch (error) {
    console.error('[Preview Queue] Ошибка добавления батч-задачи:', error)
    return null
  }
}

/**
 * Получить статус задачи по ID
 */
export async function getJobStatus(jobId: string): Promise<any> {
  const queue = getPreviewQueue()
  
  if (!queue) {
    return { status: 'unavailable', error: 'Queue not configured' }
  }

  try {
    const job = await queue.getJob(jobId)
    
    if (!job) {
      return { status: 'not_found' }
    }

    const state = await job.getState()
    const progress = job.progress
    const failedReason = job.failedReason

    return {
      status: state,
      progress,
      failedReason,
      data: job.data,
    }
  } catch (error) {
    console.error('[Preview Queue] Ошибка получения статуса:', error)
    return { status: 'error', error: String(error) }
  }
}

/**
 * Очистить завершённые задачи
 */
export async function cleanCompletedJobs(): Promise<void> {
  const queue = getPreviewQueue()
  
  if (!queue) {
    return
  }

  try {
    await queue.clean(24 * 3600 * 1000, 100, 'completed') // 24 часа, макс 100
    console.log('[Preview Queue] Очищены завершённые задачи')
  } catch (error) {
    console.error('[Preview Queue] Ошибка очистки задач:', error)
  }
}

