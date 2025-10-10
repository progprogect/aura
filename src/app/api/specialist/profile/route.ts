/**
 * API для обновления профиля специалиста (inline editing)
 * PATCH /api/specialist/profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getAuthSession, UNAUTHORIZED_RESPONSE, SESSION_EXPIRED_RESPONSE } from '@/lib/auth/api-auth'
import { revalidateSpecialistProfile } from '@/lib/revalidation'

// Схема для обновления профиля
const UpdateProfileSchema = z.object({
  field: z.enum([
    'firstName',
    'lastName',
    'category',
    'tagline',
    'about',
    'city',
    'country',
    'email',
    'telegram',
    'whatsapp',
    'instagram',
    'website',
    'priceFrom',
    'priceTo',
    'priceDescription',
    'yearsOfPractice',
    'videoUrl',
    'acceptingClients',
    // Новые поля для контактов с клиентами
    'contactEmail',
    'contactPhone',
    'contactTelegram',
    'contactWhatsapp'
  ]),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
})

export async function PATCH(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    // Проверяем, есть ли профиль специалиста
    if (!session.specialistProfile) {
      return NextResponse.json(
        { success: false, error: 'Профиль специалиста не найден' },
        { status: 404 }
      )
    }

    // Парсим тело запроса
    const body = await request.json()
    const { field, value } = UpdateProfileSchema.parse(body)

    // Специальная обработка для числовых полей
    let processedValue = value
    if (field === 'priceFrom' || field === 'priceTo' || field === 'yearsOfPractice') {
      if (typeof value === 'string') {
        processedValue = value ? parseInt(value, 10) : null
      }
    }

    // Поля User (обновляем в таблице User)
    const userFields = ['firstName', 'lastName', 'email']
    
    // Поля SpecialistProfile (обновляем в таблице SpecialistProfile)
    const specialistFields = [
      'category', 'tagline', 'about', 'city', 'country',
      'telegram', 'whatsapp', 'instagram', 'website',
      'priceFrom', 'priceTo', 'priceDescription',
      'yearsOfPractice', 'videoUrl', 'acceptingClients'
    ]

    let updatedValue
    
    if (userFields.includes(field)) {
      // Обновляем User
      const user = await prisma.user.update({
        where: { id: session.userId },
        data: {
          [field]: processedValue,
        }
      })
      updatedValue = user[field as keyof typeof user]
    } else if (specialistFields.includes(field)) {
      // Обновляем SpecialistProfile
      const specialistProfile = await prisma.specialistProfile.update({
        where: { id: session.specialistProfile!.id },
        data: {
          [field]: processedValue,
        }
      })
      updatedValue = specialistProfile[field as keyof typeof specialistProfile]
    } else {
      return NextResponse.json(
        { success: false, error: 'Неизвестное поле' },
        { status: 400 }
      )
    }

    // Инвалидируем кеш профиля
    if (session.specialistProfile) {
      const specialistProfile = await prisma.specialistProfile.findUnique({
        where: { id: session.specialistProfile.id },
        select: { slug: true }
      })
      if (specialistProfile) {
        await revalidateSpecialistProfile(specialistProfile.slug)
      }
    }

    return NextResponse.json({
      success: true,
      field,
      value: updatedValue,
      message: 'Профиль обновлён'
    })

  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ошибка валидации данных',
          details: error.issues
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

