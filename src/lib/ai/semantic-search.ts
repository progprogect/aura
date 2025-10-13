/**
 * Semantic search через MongoDB
 */

import { prisma } from '@/lib/db'
import { generateQueryEmbedding } from './embeddings'
import { findSimilarEmbeddings } from './mongodb-client'
import { SpecialistLimitsService } from '@/lib/specialist/limits-service'
import type { SearchOptions, SearchFilters, Specialist, SpecialistWhereInput } from './types'

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
    console.log('[Semantic Search] 🧮 Query embedding generated:', queryEmbedding.length, 'dimensions')

    // 2. Находим похожие embeddings в MongoDB (с фильтром по категории!)
    const similarEmbeddings = await findSimilarEmbeddings(
      queryEmbedding, 
      limit * 2, 
      excludeIds,
      filters.category // ← ФИЛЬТР ПО КАТЕГОРИИ В MONGODB!
    )

    if (similarEmbeddings.length === 0) {
      console.warn('[Semantic Search] ⚠️ No embeddings found in MongoDB - falling back to keyword search')
      return await searchSpecialistsByKeyword(options)
    }

    console.log('[Semantic Search] 📊 Similar embeddings found:', similarEmbeddings.length)

  const specialistIds = similarEmbeddings.map((e) => e.specialistId)

  console.log('[Semantic Search] 🔑 Specialist IDs from MongoDB:', specialistIds.slice(0, 5).map(id => id.substring(0, 10)))

  // 3. Строим фильтры для Prisma
  const where: SpecialistWhereInput = {
    id: { in: specialistIds },
    acceptingClients: true,
  }

  console.log('[Semantic Search] 🔍 Prisma where (before optional filters):', { ids: specialistIds.length, acceptingClients: true })

  // Категория УЖЕ отфильтрована в MongoDB! Не дублируем фильтр
  // if (filters.category) {
  //   where.category = filters.category
  //   console.log('[Semantic Search] 📂 Adding category filter:', filters.category)
  // }

  // workFormats: фильтруем ТОЛЬКО если выбран конкретный формат
  // Если ['online', 'offline'] (оба) = "Неважно" → НЕ фильтруем
  if (filters.workFormats && filters.workFormats.length === 1) {
    where.workFormats = { hasSome: filters.workFormats as any }
    console.log('[Semantic Search] 💻 Adding workFormats filter:', filters.workFormats)
  } else if (filters.workFormats && filters.workFormats.length > 1) {
    console.log('[Semantic Search] 💻 Skipping workFormats filter (user selected "any")')
  }

  if (filters.city) {
    where.city = filters.city
    console.log('[Semantic Search] 📍 Adding city filter:', filters.city)
  }

  if (filters.minExperience) {
    where.yearsOfPractice = { gte: filters.minExperience }
  }

  if (filters.maxPrice) {
    // ВАЖНО: Цена в БД в КОПЕЙКАХ! Конвертируем рубли → копейки
    const maxPriceInKopecks = filters.maxPrice * 100
    where.OR = [{ priceFrom: null }, { priceFrom: { lte: maxPriceInKopecks } }]
    console.log('[Semantic Search] 💰 Price filter:', filters.maxPrice, '₽ =', maxPriceInKopecks, 'копеек')
  }

  if (filters.verified) {
    where.verified = true
  }

  // 4. Получаем специалистов из PostgreSQL (Unified)
  console.log('[Semantic Search] 🗄️ Querying PostgreSQL...')
  console.log('[Semantic Search] 📋 Where clause:', JSON.stringify(where, null, 2))
  
  // Получаем всех специалистов
  const allSpecialistProfiles = await prisma.specialistProfile.findMany({
    where,
    take: limit * 2, // Берем больше для фильтрации
    select: {
      id: true,
      slug: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
        }
      },
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

  // Фильтруем только видимых специалистов (с баллами > 0)
  const specialistProfiles = []
  for (const profile of allSpecialistProfiles) {
    const isVisible = await SpecialistLimitsService.isProfileVisible(profile.id)
    if (isVisible) {
      specialistProfiles.push(profile)
      if (specialistProfiles.length >= limit) break // Останавливаемся, когда набрали нужное количество
    }
  }

  console.log('[Semantic Search] 📊 PostgreSQL returned:', specialistProfiles.length, 'specialists')
  
  if (specialistProfiles.length === 0) {
    console.warn('[Semantic Search] ⚠️ PostgreSQL returned 0 - checking why...')
    // Проверяем без фильтров для debug
    const allFromIds = await prisma.specialistProfile.findMany({
      where: { id: { in: specialistIds } },
      select: { id: true, category: true, acceptingClients: true }
    })
    console.log('[Semantic Search] 🔍 Same IDs without filters:', allFromIds.length, 'found')
    if (allFromIds.length > 0) {
      console.log('[Semantic Search] 🔍 First specialist:', allFromIds[0])
    }
  }

  // Преобразуем specialistProfiles в формат Specialist для совместимости
  const specialists = specialistProfiles.map(profile => ({
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
    customFields: profile.customFields,
  }))

  // 5. Сортируем по similarity из MongoDB
  const specialistsWithSimilarity = specialists.map((specialist) => {
    const embedding = similarEmbeddings.find((e) => e.specialistId === specialist.id)
    return {
      ...specialist,
      distance: embedding ? 1 - embedding.similarity : 1, // Конвертируем similarity в distance
    }
  })

  specialistsWithSimilarity.sort((a, b) => a.distance - b.distance)

  console.log(`[Semantic Search] ✅ Returning ${specialistsWithSimilarity.length} specialists (after filters)`)

  return specialistsWithSimilarity as Specialist[]
  } catch (error) {
    console.error('[Semantic Search] ❌ Error:', error)
    console.log('[Semantic Search] 🔄 Falling back to keyword search...')
    return await searchSpecialistsByKeyword(options)
  }
}

/**
 * Keyword fallback search (если embeddings не готовы или OpenAI недоступен)
 */
export async function searchSpecialistsByKeyword(options: SearchOptions): Promise<Specialist[]> {
  const { query, filters = {}, limit = 20, excludeIds = [] } = options

  console.log('[Keyword Search] Query:', query)

  const where: SpecialistWhereInput = {
    acceptingClients: true,
    id: excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
    category: filters.category,
    workFormats: filters.workFormats ? { hasSome: filters.workFormats as any } : undefined,
    city: filters.city,
    yearsOfPractice: filters.minExperience ? { gte: filters.minExperience } : undefined,
    priceFrom: filters.maxPrice ? { lte: filters.maxPrice } : undefined,
    verified: filters.verified,
  }

  // Поиск по тексту (расширяем тип для поиска)
  if (query) {
    const searchTerm = query.toLowerCase()
    ;(where as any).OR = [
      { user: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
      { user: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
      { tagline: { contains: searchTerm, mode: 'insensitive' } },
      { about: { contains: searchTerm, mode: 'insensitive' } },
    ]
  }

  // Получаем всех специалистов
  const allResults = await prisma.specialistProfile.findMany({
    where,
    take: limit * 2, // Берем больше для фильтрации
    orderBy: [{ verified: 'desc' }, { profileViews: 'desc' }],
    select: {
      id: true,
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
      user: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
        }
      }
    },
  })

  // Фильтруем только видимых специалистов (с баллами > 0)
  const results = []
  for (const profile of allResults) {
    const isVisible = await SpecialistLimitsService.isProfileVisible(profile.id)
    if (isVisible) {
      results.push(profile)
      if (results.length >= limit) break // Останавливаемся, когда набрали нужное количество
    }
  }

  console.log(`[Keyword Search] Found ${results.length} specialists`)

  // Преобразуем в формат Specialist
  return results.map(profile => ({
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
    customFields: profile.customFields,
  })) as Specialist[]
}

