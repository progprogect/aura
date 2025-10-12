/**
 * API для управления конкретной услугой
 * PATCH - обновление услуги
 * DELETE - удаление услуги (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { UpdateServiceSchema } from '@/lib/validations/api'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { validateHighlights } from '@/lib/services/utils'
import { revalidateSpecialistProfile } from '@/lib/revalidation'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const serviceId = params.id
    const body = await request.json()
    const data = UpdateServiceSchema.parse(body)

    // Проверяем, что услуга принадлежит текущему специалисту
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { specialistProfileId: true }
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Услуга не найдена' },
        { status: 404 }
      )
    }

    if (service.specialistProfileId !== session.specialistProfile.id) {
      return NextResponse.json(
        { success: false, error: 'Нет доступа' },
        { status: 403 }
      )
    }

    // Валидируем highlights если они обновляются
    let sanitizedHighlights: string[] | undefined
    if (data.highlights) {
      const highlightsValidation = validateHighlights(data.highlights)
      if (!highlightsValidation.valid) {
        return NextResponse.json(
          { success: false, error: highlightsValidation.error },
          { status: 400 }
        )
      }
      sanitizedHighlights = highlightsValidation.sanitized
    }

    // Обновляем услугу
    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: {
        title: data.title,
        description: data.description,
        highlights: sanitizedHighlights,
        price: data.price,
        deliveryDays: data.deliveryDays !== undefined ? data.deliveryDays : undefined,
        emoji: data.emoji,
        isActive: data.isActive,
        updatedAt: new Date()
      }
    })

    // Инвалидируем кеш профиля
    const specialistProfile = await prisma.specialistProfile.findUnique({
      where: { id: session.specialistProfile.id },
      select: { slug: true }
    })
    if (specialistProfile) {
      await revalidateSpecialistProfile(specialistProfile.slug)
    }

    return NextResponse.json({ success: true, service: updated })

  } catch (error) {
    console.error('[API/services/update] Ошибка:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const serviceId = params.id

    // Проверяем, что услуга принадлежит текущему специалисту
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { specialistProfileId: true }
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Услуга не найдена' },
        { status: 404 }
      )
    }

    if (service.specialistProfileId !== session.specialistProfile.id) {
      return NextResponse.json(
        { success: false, error: 'Нет доступа' },
        { status: 403 }
      )
    }

    // Soft delete - помечаем как неактивную
    await prisma.service.update({
      where: { id: serviceId },
      data: { isActive: false }
    })

    // Инвалидируем кеш профиля
    const specialistProfile = await prisma.specialistProfile.findUnique({
      where: { id: session.specialistProfile.id },
      select: { slug: true }
    })
    if (specialistProfile) {
      await revalidateSpecialistProfile(specialistProfile.slug)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[API/services/delete] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

