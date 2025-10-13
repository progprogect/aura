/**
 * API для получения информации о пакетах
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { getAllPackages, getPopularPackage } from '@/lib/packages/specialist-packages'
import { SpecialistLimitsService } from '@/lib/specialist/limits-service'

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const user = await getCurrentUser()
    if (!user?.specialistProfile) {
      return NextResponse.json({ error: 'Только для специалистов' }, { status: 403 })
    }

    // Получаем текущие лимиты специалиста
    const limits = await SpecialistLimitsService.getSpecialistLimits(user.specialistProfile.id)
    if (!limits) {
      return NextResponse.json({ error: 'Ошибка получения лимитов' }, { status: 500 })
    }

    // Получаем пакеты
    const packages = getAllPackages()
    const popularPackage = getPopularPackage()

    return NextResponse.json({
      packages,
      popularPackage,
      currentLimits: {
        totalBalance: limits.totalBalance,
        contactViewsAvailable: limits.contactViewsAvailable,
        requestsAvailable: limits.requestsAvailable,
        isVisible: limits.isVisible
      }
    })

  } catch (error) {
    console.error('Ошибка получения пакетов:', error)
    return NextResponse.json(
      { error: 'Ошибка получения пакетов' }, 
      { status: 500 }
    )
  }
}
