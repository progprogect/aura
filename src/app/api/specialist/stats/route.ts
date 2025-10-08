/**
 * API для получения статистики специалиста
 * GET /api/specialist/stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const authSession = await getAuthSession(request)
    
    if (!authSession) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    // Получаем полные данные специалиста
    const specialist = await prisma.specialist.findUnique({
      where: { id: authSession.specialistId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        slug: true,
        category: true,
        specializations: true,
        verified: true,
        profileViews: true,
        contactViews: true,
        acceptingClients: true,
        
        // Для расчёта процента заполнения
        tagline: true,
        about: true,
        city: true,
        email: true,
        priceFrom: true,
        priceTo: true,
        yearsOfPractice: true,
        videoUrl: true,
        
        // Связанные данные
        education: true,
        certificates: true,
        gallery: true,
        faqs: true,
      }
    })

    if (!specialist) {
      return NextResponse.json(
        { success: false, error: 'Специалист не найден' },
        { status: 404 }
      )
    }

    // Подсчитываем процент заполнения профиля
    const completionFields = {
      // Обязательные (уже есть после онбординга)
      firstName: specialist.firstName ? 1 : 0,
      lastName: specialist.lastName ? 1 : 0,
      about: specialist.about ? 1 : 0,
      specializations: specialist.specializations.length > 0 ? 1 : 0,
      
      // Опциональные (добавляют процент)
      avatar: specialist.avatar ? 15 : 0,
      tagline: specialist.tagline ? 5 : 0,
      city: specialist.city ? 5 : 0,
      email: specialist.email ? 5 : 0,
      prices: (specialist.priceFrom || specialist.priceTo) ? 10 : 0,
      yearsOfPractice: specialist.yearsOfPractice ? 5 : 0,
      education: specialist.education.length > 0 ? 15 : 0,
      certificates: specialist.certificates.length > 0 ? 20 : 0,
      gallery: specialist.gallery.length > 0 ? 10 : 0,
      faqs: specialist.faqs.length > 0 ? 5 : 0,
      video: specialist.videoUrl ? 10 : 0,
    }

    // Базовые поля (20% за создание профиля)
    const baseCompletion = 20
    const additionalCompletion = Object.values(completionFields).reduce((sum, val) => sum + val, 0) - 4 // минус обязательные поля
    const completionPercentage = Math.min(100, baseCompletion + additionalCompletion)

    // Получаем количество заявок (из ConsultationRequest)
    const consultationRequestsCount = await prisma.consultationRequest.count({
      where: {
        specialistId: specialist.id,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // за последние 7 дней
        }
      }
    })

    // Формируем задания для дозаполнения
    const tasks = []
    
    if (!specialist.avatar) {
      tasks.push({
        id: 'avatar',
        title: 'Добавьте фото профиля',
        description: 'Профиль с фото вызывает больше доверия',
        bonus: 15,
        completed: false
      })
    }
    
    if (specialist.certificates.length === 0) {
      tasks.push({
        id: 'certificates',
        title: 'Загрузите сертификаты',
        description: 'Подтвердите свою квалификацию',
        bonus: 20,
        completed: false
      })
    }
    
    if (specialist.education.length === 0) {
      tasks.push({
        id: 'education',
        title: 'Добавьте образование',
        description: 'Укажите ваше профессиональное образование',
        bonus: 15,
        completed: false
      })
    }
    
    if (specialist.gallery.length === 0) {
      tasks.push({
        id: 'gallery',
        title: 'Создайте галерею',
        description: 'Добавьте фото вашего кабинета или процесса работы',
        bonus: 10,
        completed: false
      })
    }
    
    if (!specialist.priceFrom && !specialist.priceTo) {
      tasks.push({
        id: 'pricing',
        title: 'Укажите цены',
        description: 'Клиентам важно знать стоимость заранее',
        bonus: 10,
        completed: false
      })
    }

    if (!specialist.videoUrl) {
      tasks.push({
        id: 'video',
        title: 'Добавьте видео-презентацию',
        description: 'Видео помогает клиентам познакомиться с вами',
        bonus: 10,
        completed: false
      })
    }

    return NextResponse.json({
      success: true,
      specialist: {
        id: specialist.id,
        firstName: specialist.firstName,
        lastName: specialist.lastName,
        avatar: specialist.avatar,
        slug: specialist.slug,
        category: specialist.category,
        specializations: specialist.specializations,
        verified: specialist.verified,
        acceptingClients: specialist.acceptingClients,
      },
      stats: {
        profileViews: specialist.profileViews,
        contactViews: specialist.contactViews,
        consultationRequests: consultationRequestsCount,
        completionPercentage,
      },
      tasks
    })

  } catch (error) {
    console.error('Ошибка при получении статистики:', error)

    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

