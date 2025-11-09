import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma Client с singleton pattern для предотвращения создания множественных соединений.
 * 
 * Важно: Connection pooling должен быть настроен через DATABASE_URL на сервере.
 * Для Railway рекомендуется использовать DATABASE_URL с параметрами pooling,
 * либо настроить внешний connection pooler (PgBouncer).
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

