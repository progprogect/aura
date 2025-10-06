/**
 * Менеджер соединений для graceful shutdown
 */

import { disconnect as disconnectMongo } from './mongodb-client'

let isShuttingDown = false

/**
 * Graceful shutdown для всех соединений
 */
export async function gracefulShutdown() {
  if (isShuttingDown) return
  isShuttingDown = true

  console.log('[Connection Manager] Starting graceful shutdown...')

  try {
    await disconnectMongo()
    console.log('[Connection Manager] All connections closed')
  } catch (error) {
    console.error('[Connection Manager] Error during shutdown:', error)
  }

  process.exit(0)
}

// Регистрируем обработчики для graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', gracefulShutdown)
  process.on('SIGTERM', gracefulShutdown)
  process.on('beforeExit', gracefulShutdown)
}

