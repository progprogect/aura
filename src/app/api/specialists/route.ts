import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GetSpecialistsQuerySchema } from '@/lib/validations/api'
import { SpecialistLimitsService } from '@/lib/specialist/limits-service'

// API routes должны быть динамическими
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Валидация параметров запроса
    // Преобразуем null в undefined для Zod optional
    const validationResult = GetSpecialistsQuerySchema.safeParse({
      category: searchParams.get('category') ?? undefined,
      experience: searchParams.get('experience') ?? undefined,
      format: searchParams.get('format') ?? undefined,
      verified: searchParams.get('verified') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
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
    // ВАЖНО: Все специалисты должны быть:
    // 1. acceptingClients: true - принимают клиентов
    // 2. verified: true - верифицированы
    // 3. Положительный баланс баллов (проверяется через getVisibleSpecialists)
    const where: any = {
      acceptingClients: true, // Принимают клиентов
      verified: true, // Всегда требуем верификацию
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
    
    // Фильтр по верификации уже установлен выше (всегда true)
    
    // Поиск по тексту (с защитой от SQL injection через Prisma)
    if (finalSearch) {
      // Экранируем специальные символы для безопасности
      const escapedSearch = finalSearch.replace(/[%_]/g, '\\$&')
      where.OR = [
        { user: { firstName: { contains: escapedSearch, mode: 'insensitive' } } },
        { user: { lastName: { contains: escapedSearch, mode: 'insensitive' } } },
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
    
    // Получение только видимых специалистов (с баллами > 0)
    const allVisibleSpecialists = await SpecialistLimitsService.getVisibleSpecialists(where)
    
    // Применяем сортировку
    const sortedSpecialists = allVisibleSpecialists.sort((a, b) => {
      switch (finalSortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'rating':
          return (b.profileViews || 0) - (a.profileViews || 0)
        case 'price':
          return (a.priceFrom || 0) - (b.priceFrom || 0)
        case 'relevance':
        default:
          // Сначала верифицированные, потом по просмотрам
          if (a.verified !== b.verified) {
            return a.verified ? -1 : 1
          }
          return (b.profileViews || 0) - (a.profileViews || 0)
      }
    })
    
    // Применяем пагинацию
    const totalCount = sortedSpecialists.length
    const startIndex = (finalPage - 1) * finalLimit
    const specialistProfiles = sortedSpecialists.slice(startIndex, startIndex + finalLimit)
    
    // Подготовка данных для фронтенда (используем трансформер)
    const formattedSpecialists = specialistProfiles.map(profile => ({
      id: profile.id,
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      avatar: profile.user.avatar,
      slug: profile.slug,
      category: profile.category,
      specializations: profile.specializations,
      tagline: profile.tagline,
      about: profile.about,
      city: profile.city,
      country: profile.country,
      workFormats: profile.workFormats,
      yearsOfPractice: profile.yearsOfPractice,
      priceFrom: profile.priceFrom,
      priceTo: profile.priceTo,
      currency: profile.currency,
      priceDescription: profile.priceDescription,
      verified: profile.verified,
      profileViews: profile.profileViews,
      customFields: profile.customFields,
      fullName: `${profile.user.firstName} ${profile.user.lastName}`,
      // Обрезаем описание до 150 символов для карточек
      shortAbout: profile.about.length > 150 
        ? profile.about.substring(0, 150) + '...' 
        : profile.about,
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
