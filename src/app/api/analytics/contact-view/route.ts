/**
 * API для отслеживания просмотра контактов
 * Списывает 1 балл у текущего пользователя за просмотр контактов специалиста
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { SpecialistLimitsService } from '@/lib/specialist/limits-service'
import { incrementContactView } from '@/lib/redis'

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
    const canUse = await SpecialistLimitsService.canUseContactView(user.id)
    if (!canUse.allowed) {
      return NextResponse.json({ 
        error: 'Недостаточно баллов для просмотра контактов',
        remaining: canUse.remaining,
        required: 1
      }, { status: 402 }) // Payment Required
    }

    // Списываем балл
    const used = await SpecialistLimitsService.consumeContactView(user.id)
    if (!used) {
      return NextResponse.json({ 
        error: 'Ошибка списания баллов' 
      }, { status: 500 })
    }

    // Увеличиваем счетчик просмотров контактов в Redis
    await incrementContactView(specialistId, contactType || 'modal_open')

    console.log(`✅ Пользователь ${user.id} просмотрел контакты специалиста ${specialistId}`)

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