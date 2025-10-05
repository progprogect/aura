import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GetSpecialistsQuerySchema } from '@/lib/validations/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Валидация параметров запроса
    const validationResult = GetSpecialistsQuerySchema.safeParse({
      category: searchParams.get('category'),
      experience: searchParams.get('experience'),
      format: searchParams.get('format'),
      verified: searchParams.get('verified'),
      sortBy: searchParams.get('sortBy'),
      search: searchParams.get('search'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    
    if (!validationResult.success) {
      console.error('Validation error in /api/specialists:', {
        errors: validationResult.error.issues,
        receivedParams: {
          category: searchParams.get('category'),
          experience: searchParams.get('experience'),
          format: searchParams.get('format'),
          verified: searchParams.get('verified'),
          sortBy: searchParams.get('sortBy'),
          search: searchParams.get('search'),
          page: searchParams.get('page'),
          limit: searchParams.get('limit'),
        }
      })
      
      return NextResponse.json(
        { 
          error: 'Некорректные параметры запроса', 
          details: validationResult.error.issues,
          receivedParams: {
            category: searchParams.get('category'),
            experience: searchParams.get('experience'),
            format: searchParams.get('format'),
            verified: searchParams.get('verified'),
            sortBy: searchParams.get('sortBy'),
            search: searchParams.get('search'),
            page: searchParams.get('page'),
            limit: searchParams.get('limit'),
          }
        },
        { status: 400 }
      )
    }
    
    const {
      category,
      experience,
      format: formatParam,
      verified,
      sortBy,
      search,
      page,
      limit,
    } = validationResult.data
    
    // Парсинг параметров
    const format = formatParam ? formatParam.split(',').filter(Boolean) : []
    const isVerified = verified === 'true'
    const finalSortBy = sortBy || 'relevance'
    const finalSearch = search || ''
    const finalPage = page || 1
    const finalLimit = limit || 12
    
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
    if (isVerified) {
      where.verified = true
    }
    
    // Поиск по тексту (с защитой от SQL injection через Prisma)
    if (finalSearch) {
      // Экранируем специальные символы для безопасности
      const escapedSearch = finalSearch.replace(/[%_]/g, '\\$&')
      where.OR = [
        { firstName: { contains: escapedSearch, mode: 'insensitive' } },
        { lastName: { contains: escapedSearch, mode: 'insensitive' } },
        { tagline: { contains: escapedSearch, mode: 'insensitive' } },
        { about: { contains: escapedSearch, mode: 'insensitive' } },
        { specializations: { hasSome: [escapedSearch] } },
      ]
    }
    
    // Сортировка
    let orderBy: any = {}
    switch (finalSortBy) {
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
        skip: (finalPage - 1) * finalLimit,
        take: finalLimit,
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
        page: finalPage,
        limit: finalLimit,
        totalCount,
        totalPages: Math.ceil(totalCount / finalLimit),
        hasNext: finalPage * finalLimit < totalCount,
        hasPrev: finalPage > 1,
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
