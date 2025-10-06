/**
 * Semantic search через MongoDB
 */

import { prisma } from '@/lib/db'
import { generateQueryEmbedding } from './embeddings'
import { findSimilarEmbeddings } from './mongodb-client'
import type { SearchOptions, SearchFilters, Specialist } from './types'

export type { SearchOptions, SearchFilters }

/**
 * Semantic search по специалистам
 */
export async function searchSpecialistsBySemantic(options: SearchOptions): Promise<Specialist[]> {
  const { query, filters = {}, limit = 20, excludeIds = [] } = options

  console.log('[Semantic Search] Query:', query)
  console.log('[Semantic Search] Filters:', filters)

  try {
    // 1. Генерируем embedding запроса
    const queryEmbedding = await generateQueryEmbedding(query)

    // 2. Находим похожие embeddings в MongoDB
    const similarEmbeddings = await findSimilarEmbeddings(queryEmbedding, limit * 2, excludeIds)

    if (similarEmbeddings.length === 0) {
      console.log('[Semantic Search] No embeddings found')
      return []
    }

    const specialistIds = similarEmbeddings.map((e) => e.specialistId)

    // 3. Строим фильтры для Prisma
    const where: any = {
    id: { in: specialistIds },
    acceptingClients: true,
  }

  if (filters.category) {
    where.category = filters.category
  }

  if (filters.workFormats && filters.workFormats.length > 0) {
    where.workFormats = { hasSome: filters.workFormats }
  }

  if (filters.city) {
    where.city = filters.city
  }

  if (filters.minExperience) {
    where.yearsOfPractice = { gte: filters.minExperience }
  }

  if (filters.maxPrice) {
    where.OR = [{ priceFrom: null }, { priceFrom: { lte: filters.maxPrice } }]
  }

  if (filters.verified) {
    where.verified = true
  }

  // 4. Получаем специалистов из PostgreSQL
  const specialists = await prisma.specialist.findMany({
    where,
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
      customFields: true,
    },
  })

  // 5. Сортируем по similarity из MongoDB
  const specialistsWithSimilarity = specialists.map((specialist) => {
    const embedding = similarEmbeddings.find((e) => e.specialistId === specialist.id)
    return {
      ...specialist,
      distance: embedding ? 1 - embedding.similarity : 1, // Конвертируем similarity в distance
    }
  })

  specialistsWithSimilarity.sort((a, b) => a.distance - b.distance)

  console.log(`[Semantic Search] Found ${specialistsWithSimilarity.length} specialists`)

  return specialistsWithSimilarity as Specialist[]
  } catch (error) {
    console.error('[Semantic Search] Error:', error)
    throw error
  }
}

/**
 * Keyword fallback search (если embeddings не готовы или OpenAI недоступен)
 */
export async function searchSpecialistsByKeyword(options: SearchOptions): Promise<Specialist[]> {
  const { query, filters = {}, limit = 20, excludeIds = [] } = options

  console.log('[Keyword Search] Query:', query)

  const where: any = {
    acceptingClients: true,
    id: excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
    category: filters.category,
    workFormats: filters.workFormats ? { hasSome: filters.workFormats } : undefined,
    city: filters.city,
    yearsOfPractice: filters.minExperience ? { gte: filters.minExperience } : undefined,
    priceFrom: filters.maxPrice ? { lte: filters.maxPrice } : undefined,
    verified: filters.verified,
  }

  // Поиск по тексту
  if (query) {
    const searchTerm = query.toLowerCase()
    where.OR = [
      { firstName: { contains: searchTerm, mode: 'insensitive' } },
      { lastName: { contains: searchTerm, mode: 'insensitive' } },
      { tagline: { contains: searchTerm, mode: 'insensitive' } },
      { about: { contains: searchTerm, mode: 'insensitive' } },
    ]
  }

  const results = await prisma.specialist.findMany({
    where,
    take: limit,
    orderBy: [{ verified: 'desc' }, { profileViews: 'desc' }],
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
      customFields: true,
    },
  })

  console.log(`[Keyword Search] Found ${results.length} specialists`)

  return results as Specialist[]
}

