/**
 * API endpoint для превращения обычного пользователя в специалиста
 * Добавляет SpecialistProfile к существующему User
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromSession } from '@/lib/auth/user-auth-service'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      )
    }

    // Получаем текущего пользователя
    const currentUser = await getUserFromSession(sessionToken)

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Сессия недействительна' },
        { status: 401 }
      )
    }

    // Проверяем, не является ли пользователь уже специалистом
    if (currentUser.hasSpecialistProfile) {
      return NextResponse.json(
        { success: false, error: 'Вы уже являетесь специалистом' },
        { status: 400 }
      )
    }

    // Генерируем уникальный slug
    const baseSlug = `${currentUser.firstName}-${currentUser.lastName}`.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9а-я-]/gi, '')
    
    const slug = await generateUniqueSlug(baseSlug)

    // Создаём профиль специалиста
    const specialistProfile = await prisma.specialistProfile.create({
      data: {
        userId: currentUser.id,
        slug,
        category: 'other', // Будет заполнено при онбординге
        specializations: ['Специалист'],
        about: '', // Будет заполнено при онбординге
        workFormats: ['online'],
        verified: false,
        acceptingClients: false
      }
    })

    return NextResponse.json({
      success: true,
      specialistProfile: {
        id: specialistProfile.id,
        slug: specialistProfile.slug
      },
      message: 'Профиль специалиста создан. Пожалуйста, заполните информацию о себе.'
    })

  } catch (error) {
    console.error('[API/auth/user/become-specialist] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// Вспомогательная функция для генерации уникального slug
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug || 'specialist'
  let counter = 1
  
  while (true) {
    const existing = await prisma.specialistProfile.findUnique({
      where: { slug }
    })
    
    if (!existing) {
      return slug
    }
    
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

