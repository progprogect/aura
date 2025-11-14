import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GetResourcesQuerySchema } from '@/lib/validations/api'
import { rankByRelevance } from '@/lib/resources/search'
import type { ResourceDTO, ResourceViewModel } from '@/lib/resources/types'

// API routes должны быть динамическими
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Валидация параметров запроса
    const validationResult = GetResourcesQuerySchema.safeParse({
      category: searchParams.get('category') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    })
    
    if (!validationResult.success) {
      console.error('Validation error in /api/resources:', {
        errors: validationResult.error.issues,
      })
      
      return NextResponse.json(
        { 
          error: 'Некорректные параметры запроса', 
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }
    
    const {
      category,
      type,
      sortBy,
      search,
      page,
      limit,
    } = validationResult.data
    
    // Парсинг параметров
    const finalType = type && type !== 'all' ? type : undefined
    const finalSortBy = sortBy || 'popularity'
    const finalSearch = search || ''
    const finalPage = page || 1
    const finalLimit = limit || 12
    
    // Построение фильтров для Prisma
    // ВАЖНО: Все лид-магниты должны быть от:
    // 1. verified = true - верифицированных специалистов
    // 2. blocked = false - не заблокированных профилей
    // 3. user.blocked = false - не заблокированных пользователей
    // 4. isActive = true - активных лид-магнитов
    // 5. slug IS NOT NULL - с валидным slug
    const baseSpecialistProfileFilter: any = {
      verified: true,
      blocked: false,
      user: {
        blocked: false,
      },
    }
    
    // Фильтр по категории специалиста
    if (category && category !== 'all') {
      baseSpecialistProfileFilter.category = category
    }
    
    const where: any = {
      isActive: true,
      slug: { not: null },
      specialistProfile: baseSpecialistProfileFilter,
    }
    
    // Фильтр по типу лид-магнита
    if (finalType) {
      where.type = finalType
    }
    
    // Поиск по тексту (с приоритетом title над description)
    if (finalSearch) {
      const escapedSearch = finalSearch.replace(/[%_]/g, '\\$&')
      where.OR = [
        { title: { contains: escapedSearch, mode: 'insensitive' } },
        { description: { contains: escapedSearch, mode: 'insensitive' } },
      ]
    }
    
    // Получаем все лид-магниты с данными специалиста
    const leadMagnets = await prisma.leadMagnet.findMany({
      where,
      include: {
        specialistProfile: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: finalSearch ? undefined : [
        // Без поиска: сортировка по популярности
        { viewCount: 'desc' },
        { downloadCount: 'desc' },
        { createdAt: 'desc' },
      ],
    })
    
    // Преобразуем в ResourceDTO
    const resources: ResourceDTO[] = leadMagnets.map(lm => ({
      id: lm.id,
      type: lm.type as 'file' | 'link' | 'service',
      title: lm.title,
      description: lm.description,
      emoji: lm.emoji,
      fileUrl: lm.fileUrl,
      linkUrl: lm.linkUrl,
      slug: lm.slug,
      highlights: lm.highlights || [],
      targetAudience: lm.targetAudience,
      fileSize: lm.fileSize,
      previewUrls: lm.previewUrls as {
        thumbnail: string
        card: string
        detail: string
      } | null,
      viewCount: lm.viewCount,
      downloadCount: lm.downloadCount,
      createdAt: lm.createdAt,
      specialist: {
        id: lm.specialistProfile.id,
        slug: lm.specialistProfile.slug,
        category: lm.specialistProfile.category,
        firstName: lm.specialistProfile.user.firstName,
        lastName: lm.specialistProfile.user.lastName,
      },
    }))
    
    // Применяем умный поиск с ранжированием, если есть поисковый запрос
    let rankedResources = resources
    if (finalSearch) {
      rankedResources = rankByRelevance(resources, finalSearch)
    }
    
    // Применяем сортировку
    let sortedResources = rankedResources
    switch (finalSortBy) {
      case 'date':
        sortedResources = [...rankedResources].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case 'relevance':
        // Уже отсортировано через rankByRelevance, если был поиск
        // Если поиска нет, сортируем по популярности
        if (!finalSearch) {
          sortedResources = [...rankedResources].sort(
            (a, b) => (b.viewCount + b.downloadCount) - (a.viewCount + a.downloadCount)
          )
        }
        break
      case 'popularity':
      default:
        sortedResources = [...rankedResources].sort(
          (a, b) => (b.viewCount + b.downloadCount) - (a.viewCount + a.downloadCount)
        )
        break
    }
    
    // Применяем пагинацию
    const totalCount = sortedResources.length
    const startIndex = (finalPage - 1) * finalLimit
    const paginatedResources = sortedResources.slice(startIndex, startIndex + finalLimit)
    
    // Преобразуем в ResourceViewModel
    const formattedResources: ResourceViewModel[] = paginatedResources.map(resource => ({
      ...resource,
      specialistFullName: `${resource.specialist.firstName} ${resource.specialist.lastName}`,
      popularityScore: resource.viewCount + resource.downloadCount,
    }))
    
    return NextResponse.json({
      resources: formattedResources,
      pagination: {
        page: finalPage,
        limit: finalLimit,
        totalCount,
        totalPages: Math.ceil(totalCount / finalLimit),
        hasNext: finalPage * finalLimit < totalCount,
        hasPrev: finalPage > 1,
      },
    })
    
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

