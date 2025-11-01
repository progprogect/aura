/**
 * API для отслеживания просмотра контактов
 * Списывает 1 балл у текущего пользователя за просмотр контактов специалиста
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { SpecialistLimitsService } from '@/lib/specialist/limits-service'
import { incrementContactView } from '@/lib/redis'
import { detectTrafficSource } from '@/lib/analytics/source-detection'

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const { specialistId, contactType } = await request.json()
    
    if (!specialistId) {
      return NextResponse.json({ error: 'specialistId обязателен' }, { status: 400 })
    }

    // Проверяем, может ли пользователь просмотреть контакты
    // Для входящих операций всегда разрешаем (может быть отрицательный баланс)
    const canUse = await SpecialistLimitsService.canUseContactView(user.id)
    if (!canUse.allowed) {
      return NextResponse.json({ 
        error: 'Пользователь не может просматривать контакты'
      }, { status: 400 })
    }

    // Списываем балл
    const used = await SpecialistLimitsService.consumeContactView(user.id)
    if (!used) {
      return NextResponse.json({ 
        error: 'Ошибка списания баллов' 
      }, { status: 500 })
    }

    // Определяем источник трафика
    const referer = request.headers.get('referer')
    const url = new URL(request.url)
    const source = detectTrafficSource(url.searchParams, referer)

    // Увеличиваем счетчик просмотров контактов в Redis с источником
    await incrementContactView(specialistId, contactType || 'modal_open', source)

    console.log(`✅ Пользователь ${user.id} просмотрел контакты специалиста ${specialistId} (источник: ${source})`)

    return NextResponse.json({ 
      success: true,
      remaining: canUse.remaining - 1
    })

  } catch (error) {
    console.error('Ошибка отслеживания просмотра контактов:', error)
    return NextResponse.json(
      { error: 'Ошибка отслеживания' }, 
      { status: 500 }
    )
  }
}