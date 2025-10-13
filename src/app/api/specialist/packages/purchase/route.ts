/**
 * API для покупки пакетов специалистами
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { PointsService } from '@/lib/points/points-service'
import { getPackage } from '@/lib/packages/specialist-packages'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const user = await getCurrentUser()
    if (!user?.specialistProfile) {
      return NextResponse.json({ error: 'Только для специалистов' }, { status: 403 })
    }

    const { packageId } = await request.json()
    
    if (!packageId) {
      return NextResponse.json({ error: 'packageId обязателен' }, { status: 400 })
    }

    // Получаем информацию о пакете
    const pkg = getPackage(packageId)
    if (!pkg) {
      return NextResponse.json({ error: 'Неверный пакет' }, { status: 400 })
    }

    // Проверяем баланс
    const balance = await PointsService.getBalance(user.id)
    if (balance.total < pkg.price) {
      return NextResponse.json({ 
        error: 'Недостаточно баллов',
        required: pkg.price,
        available: balance.total 
      }, { status: 400 })
    }

    // Списываем баллы
    const result = await PointsService.deductPoints(
      user.id,
      pkg.price,
      'package_purchase',
      `Покупка пакета ${pkg.name}`
    )

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Ошибка списания баллов',
        details: result.error 
      }, { status: 500 })
    }

    // Записываем покупку пакета
    await prisma.packagePurchase.create({
      data: {
        specialistProfileId: user.specialistProfile.id,
        packageId: pkg.id,
        pointsSpent: pkg.price
      }
    })

    console.log(`✅ Специалист ${user.specialistProfile.id} купил пакет ${pkg.name} за ${pkg.price} баллов`)

    return NextResponse.json({ 
      success: true,
      package: pkg,
      newBalance: result.balance
    })

  } catch (error) {
    console.error('Ошибка покупки пакета:', error)
    return NextResponse.json(
      { error: 'Ошибка покупки пакета' }, 
      { status: 500 }
    )
  }
}
