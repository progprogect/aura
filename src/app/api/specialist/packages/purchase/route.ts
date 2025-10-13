/**
 * API для покупки пакетов специалистами
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { PointsService } from '@/lib/points/points-service'
import { getPackage } from '@/lib/packages/specialist-packages'
import { prisma } from '@/lib/db'
import { Decimal } from 'decimal.js'

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
    if (balance.total.lt(pkg.price)) {
      return NextResponse.json({ 
        error: 'Недостаточно баллов',
        required: pkg.price,
        available: balance.total.toNumber()
      }, { status: 400 })
    }

    // Списываем баллы
    try {
      await PointsService.deductPoints(
        user.id,
        new Decimal(pkg.price),
        'package_purchase',
        `Покупка пакета ${pkg.name}`
      )
    } catch (error) {
      return NextResponse.json({ 
        error: 'Ошибка списания баллов',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }, { status: 400 })
    }

    // Записываем покупку пакета
    await prisma.packagePurchase.create({
      data: {
        specialistProfileId: user.specialistProfile.id,
        packageId: pkg.id,
        pointsSpent: pkg.price
      }
    })

    // Получаем новый баланс
    const newBalance = await PointsService.getBalance(user.id)

    console.log(`✅ Специалист ${user.specialistProfile.id} купил пакет ${pkg.name} за ${pkg.price} баллов`)

    return NextResponse.json({ 
      success: true,
      package: pkg,
      newBalance: newBalance.total.toNumber()
    })

  } catch (error) {
    console.error('Ошибка покупки пакета:', error)
    return NextResponse.json(
      { error: 'Ошибка покупки пакета' }, 
      { status: 500 }
    )
  }
}
