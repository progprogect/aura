import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Параметры фильтрации
    const category = searchParams.get('category')
    const experience = searchParams.get('experience')
    const format = searchParams.get('format')?.split(',') || []
    const verified = searchParams.get('verified') === 'true'
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    
    // Построение фильтров для Prisma
    const where: any = {
      acceptingClients: true,
    }
    
    // Фильтр по категории
    if (category && category !== 'all') {
      where.category = category
    }
    
    // Фильтр по опыту работы
    if (experience && experience !== 'any') {
      switch (experience) {
        case '0-2':
          where.yearsOfPractice = { lt: 2 }
          break
        case '2-5':
          where.yearsOfPractice = { gte: 2, lt: 5 }
          break
        case '5+':
          where.yearsOfPractice = { gte: 5 }
          break
      }
    }
    
    // Фильтр по формату работы
    if (format.length > 0) {
      where.workFormats = { hasSome: format }
    }
    
    // Фильтр по верификации
    if (verified) {
      where.verified = true
    }
    
    // Поиск по тексту
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { about: { contains: search, mode: 'insensitive' } },
        { specializations: { hasSome: [search] } },
      ]
    }
    
    // Сортировка
    let orderBy: any = {}
    switch (sortBy) {
      case 'rating':
        // Пока нет рейтинга, сортируем по верификации и просмотрам
        orderBy = [
          { verified: 'desc' },
          { profileViews: 'desc' }
        ]
        break
      case 'experience':
        orderBy = { yearsOfPractice: 'desc' }
        break
      case 'price':
        orderBy = { priceFrom: 'asc' }
        break
      case 'relevance':
      default:
        orderBy = [
          { verified: 'desc' },
          { profileViews: 'desc' },
          { createdAt: 'desc' }
        ]
        break
    }
    
    // Получение специалистов с пагинацией
    const [specialists, totalCount] = await Promise.all([
      prisma.specialist.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          slug: true,
          category: true,
          specializations: true,
          tagline: true,
          about: true,
          city: true,
          country: true,
          workFormats: true,
          yearsOfPractice: true,
          priceFrom: true,
          priceTo: true,
          currency: true,
          priceDescription: true,
          verified: true,
          profileViews: true,
          customFields: true,
        }
      }),
      prisma.specialist.count({ where })
    ])
    
    // Подготовка данных для фронтенда
    const formattedSpecialists = specialists.map(specialist => ({
      ...specialist,
      fullName: `${specialist.firstName} ${specialist.lastName}`,
      // Обрезаем описание до 150 символов для карточек
      shortAbout: specialist.about.length > 150 
        ? specialist.about.substring(0, 150) + '...' 
        : specialist.about,
    }))
    
    return NextResponse.json({
      specialists: formattedSpecialists,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      }
    })
    
  } catch (error) {
    console.error('Error fetching specialists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch specialists' },
      { status: 500 }
    )
  }
}
