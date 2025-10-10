/**
 * Конфигурация BullMQ для фоновой обработки задач
 * Использует существующий Redis из Railway
 */

import { Queue, QueueOptions, ConnectionOptions } from 'bullmq'

/**
 * Настройки подключения к Redis
 */
export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_PUBLIC_URL 
    ? new URL(process.env.REDIS_PUBLIC_URL).hostname 
    : 'localhost',
  port: process.env.REDIS_PUBLIC_URL 
    ? parseInt(new URL(process.env.REDIS_PUBLIC_URL).port) 
    : 6379,
  password: process.env.REDIS_PUBLIC_URL 
    ? new URL(process.env.REDIS_PUBLIC_URL).password 
    : undefined,
  maxRetriesPerRequest: null, // Рекомендовано для BullMQ
  enableReadyCheck: false, // Оптимизация для BullMQ
}

/**
 * Базовые настройки очереди
 */
export const defaultQueueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // 3 попытки
    backoff: {
      type: 'exponential', // Экспоненциальная задержка между попытками
      delay: 2000, // Начальная задержка 2 секунды
    },
    removeOnComplete: {
      age: 24 * 3600, // Удалять успешные задачи через 24 часа
      count: 100, // Хранить максимум 100 успешных задач
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Удалять проваленные задачи через 7 дней
    },
  },
}

/**
 * Проверка подключения к Redis
 */
export function isRedisConfigured(): boolean {
  return !!process.env.REDIS_PUBLIC_URL || !!process.env.REDIS_URL
}

