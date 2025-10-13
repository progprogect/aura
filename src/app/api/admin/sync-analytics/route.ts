/**
 * API для синхронизации аналитики Redis -> БД
 * Используется администратором для обновления статистики
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getProfileViews, getContactViews } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию (пока простое условие)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Начинаем синхронизацию аналитики...')

    // Получаем всех специалистов
    const specialists = await prisma.specialistProfile.findMany({
      select: { id: true, profileViews: true, contactViews: true }
    })

    let syncedCount = 0
    let errorCount = 0

    for (const specialist of specialists) {
      try {
        // Получаем данные из Redis
        const [redisProfileViews, redisContactViews] = await Promise.all([
          getProfileViews(specialist.id),
          getContactViews(specialist.id)
        ])

        // Обновляем БД, если данные изменились
        if (redisProfileViews > specialist.profileViews || redisContactViews > specialist.contactViews) {
          await prisma.specialistProfile.update({
            where: { id: specialist.id },
            data: {
              profileViews: Math.max(redisProfileViews, specialist.profileViews),
              contactViews: Math.max(redisContactViews, specialist.contactViews)
            }
          })
          
          syncedCount++
          console.log(`✅ Синхронизирован ${specialist.id}: ${redisProfileViews} просмотров профиля, ${redisContactViews} просмотров контактов`)
        }
      } catch (error) {
        errorCount++
        console.error(`❌ Ошибка синхронизации ${specialist.id}:`, error)
      }
    }

    console.log(`🎉 Синхронизация завершена: ${syncedCount} обновлено, ${errorCount} ошибок`)

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      errors: errorCount,
      total: specialists.length
    })

  } catch (error) {
    console.error('Ошибка синхронизации аналитики:', error)
    return NextResponse.json(
      { error: 'Ошибка синхронизации' }, 
      { status: 500 }
    )
  }
}
