/**
 * API для создания профиля специалиста через онбординг
 * POST /api/specialist/onboarding
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils/slug'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

// Валидация данных онбординга
const OnboardingSchema = z.object({
  // Шаг 1: Базовая информация
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
  category: z.enum([
    'psychology',
    'fitness',
    'nutrition',
    'massage',
    'wellness',
    'coaching',
    'medicine',
    'other'
  ]),
  
  // Шаг 2: Описание
  tagline: z.string().min(10, 'Краткое описание должно содержать минимум 10 символов').max(200, 'Максимум 200 символов').optional(),
  about: z.string().min(50, 'Описание должно содержать минимум 50 символов'),
  specializations: z.array(z.string()).min(1, 'Выберите хотя бы одну специализацию').max(5, 'Максимум 5 специализаций'),
  
  // Шаг 3: Контакты и локация
  phone: z.string(),
  email: z.string().email('Некорректный email').optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().default('Россия'),
  workFormats: z.array(z.enum(['online', 'offline', 'hybrid'])).default(['online']),
  
  // Опциональные поля
  yearsOfPractice: z.number().int().min(0).max(50).optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    // Проверяем, не создан ли уже профиль
    if (session.specialist.firstName && session.specialist.lastName && session.specialist.about) {
      return NextResponse.json(
        { success: false, error: 'Профиль уже создан', slug: session.specialist.slug },
        { status: 400 }
      )
    }

    // Парсим тело запроса
    const body = await request.json()
    const data = OnboardingSchema.parse(body)

    // Генерируем уникальный slug
    const baseSlug = generateSlug(`${data.firstName} ${data.lastName}`)
    let slug = baseSlug
    let counter = 1

    while (await prisma.specialist.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Обновляем профиль специалиста
    const specialist = await prisma.specialist.update({
      where: { id: session.specialistId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        slug,
        category: data.category,
        tagline: data.tagline || null,
        about: data.about,
        specializations: data.specializations,
        phone: data.phone,
        email: data.email || null,
        city: data.city || null,
        country: data.country,
        workFormats: data.workFormats,
        yearsOfPractice: data.yearsOfPractice || null,
      }
    })

    return NextResponse.json({
      success: true,
      specialistId: specialist.id,
      slug: specialist.slug,
      message: 'Профиль успешно создан'
    })

  } catch (error) {
    console.error('Ошибка при создании профиля:', error)

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

