/**
 * API для создания профиля специалиста через онбординг
 * POST /api/specialist/onboarding
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils/slug'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

// Базовая схема для специалистов
const SpecialistOnboardingSchema = z.object({
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
  email: z.string().email('Некорректный email'),
  city: z.string().optional().nullable(),
  country: z.string().default('Россия'),
  workFormats: z.array(z.enum(['online', 'offline', 'hybrid'])).default(['online']),
  
  // Опциональные поля
  yearsOfPractice: z.number().int().min(0).max(50).optional().nullable(),
})

// Схема для компаний
const CompanyOnboardingSchema = z.object({
  // Шаг 1: Базовая информация
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
  companyName: z.string().min(2, 'Название компании должно содержать минимум 2 символа'),
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
  
  // Шаг 3: Контакты и адрес
  phone: z.string(),
  email: z.string().email('Некорректный email'),
  address: z.string().min(5, 'Адрес должен содержать минимум 5 символов'),
  addressCoordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  taxId: z.string().min(5, 'УНП/ИНН должен содержать минимум 5 символов'),
  website: z.string().url('Некорректный URL сайта').optional().nullable(),
  country: z.string().default('Россия'),
  workFormats: z.array(z.enum(['online', 'offline', 'hybrid'])).default(['online']),
})

export async function POST(request: NextRequest) {
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

    // Проверяем, не заполнен ли уже профиль
    const existingProfile = await prisma.specialistProfile.findUnique({
      where: { id: session.specialistProfile!.id }
    })

    if (existingProfile && existingProfile.about && existingProfile.about.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Профиль уже создан', slug: existingProfile.slug },
        { status: 400 }
      )
    }

    // Определяем тип профиля
    const profileType = existingProfile?.profileType || 'specialist'

    // Парсим тело запроса в зависимости от типа профиля
    const body = await request.json()
    let data: any

    if (profileType === 'company') {
      data = CompanyOnboardingSchema.parse(body)
    } else {
      data = SpecialistOnboardingSchema.parse(body)
    }

    // Генерируем уникальный slug
    const baseSlug = profileType === 'company' 
      ? generateSlug(data.companyName) || 'company'
      : generateSlug(`${data.firstName} ${data.lastName}`) || 'specialist'
    let slug = baseSlug
    let counter = 1

    while (await prisma.specialistProfile.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Обновляем User (имя и фамилию)
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
      }
    })

    // Подготавливаем данные для обновления профиля
    const updateData: any = {
      slug,
      category: data.category,
      tagline: data.tagline || null,
      about: data.about,
      specializations: data.specializations,
      country: data.country,
      workFormats: data.workFormats,
    }

    // Добавляем поля в зависимости от типа профиля
    if (profileType === 'company') {
      updateData.companyName = data.companyName
      updateData.address = data.address
      updateData.addressCoordinates = data.addressCoordinates || null
      updateData.taxId = data.taxId
      updateData.website = data.website || null
      // Для компаний извлекаем город из адреса (опционально)
      if (data.address) {
        const cityMatch = data.address.match(/(?:г\.|город|city)\s*([^,]+)/i)
        updateData.city = cityMatch ? cityMatch[1].trim() : null
      }
    } else {
      updateData.city = data.city || null
      updateData.yearsOfPractice = data.yearsOfPractice || null
    }

    // Обновляем профиль
    const specialistProfile = await prisma.specialistProfile.update({
      where: { id: session.specialistProfile!.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      specialistProfileId: specialistProfile.id,
      slug: specialistProfile.slug,
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

