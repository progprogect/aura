/**
 * API для управления услугами специалиста
 * GET - получение всех услуг
 * POST - создание новой услуги
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CreateServiceSchema } from '@/lib/validations/api'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { generateServiceSlug, validateHighlights } from '@/lib/services/utils'
import { SERVICE_LIMITS } from '@/lib/services/constants'
import { revalidateSpecialistProfile } from '@/lib/revalidation'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    if (!session.specialistProfile) {
      return NextResponse.json(
        { success: false, error: 'Профиль специалиста не найден' },
        { status: 404 }
      )
    }

    const services = await prisma.service.findMany({
      where: {
        specialistProfileId: session.specialistProfile.id,
        isActive: true
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ success: true, services })

  } catch (error) {
    console.error('[API/services/GET] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    if (!session.specialistProfile) {
      return NextResponse.json(
        { success: false, error: 'Профиль специалиста не найден' },
        { status: 404 }
      )
    }

    // Проверяем лимит
    const count = await prisma.service.count({
      where: {
        specialistProfileId: session.specialistProfile.id,
        isActive: true
      }
    })

    if (count >= SERVICE_LIMITS.MAX_COUNT) {
      return NextResponse.json(
        { success: false, error: `Максимум ${SERVICE_LIMITS.MAX_COUNT} услуг` },
        { status: 400 }
      )
    }

    const body = await request.json()
    const data = CreateServiceSchema.parse(body)

    // Валидируем highlights
    const highlightsValidation = validateHighlights(data.highlights)
    if (!highlightsValidation.valid) {
      return NextResponse.json(
        { success: false, error: highlightsValidation.error },
        { status: 400 }
      )
    }

    // Получаем существующие slugs для проверки уникальности
    const existingSlugs = await prisma.service.findMany({
      where: { 
        specialistProfileId: session.specialistProfile.id
      },
      select: { slug: true }
    })

    // Генерируем уникальный slug
    const slug = generateServiceSlug(
      data.title,
      existingSlugs.map(s => s.slug).filter(Boolean) as string[]
    )

    // Получаем максимальный order
    const maxOrder = await prisma.service.findFirst({
      where: { specialistProfileId: session.specialistProfile.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const service = await prisma.service.create({
      data: {
        specialistProfileId: session.specialistProfile.id,
        title: data.title,
        description: data.description,
        slug,
        highlights: highlightsValidation.sanitized,
        price: data.price,
        deliveryDays: data.deliveryDays || null,
        emoji: data.emoji,
        order: (maxOrder?.order || 0) + 1,
      }
    })

    // Инвалидируем кеш профиля для мгновенного отображения
    const specialistProfile = await prisma.specialistProfile.findUnique({
      where: { id: session.specialistProfile.id },
      select: { slug: true }
    })
    if (specialistProfile) {
      await revalidateSpecialistProfile(specialistProfile.slug)
    }

    return NextResponse.json({ success: true, service })

  } catch (error) {
    console.error('[API/services/POST] Ошибка:', error)
    
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: (error as any).issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

