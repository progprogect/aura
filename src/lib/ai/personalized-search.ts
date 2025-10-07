/**
 * Персонализированный поиск специалистов
 * Ранжирует специалистов с учётом личного профиля пользователя
 */

import { PersonalProfile } from './personal-questions-generator'
import { calculatePersonalizationScore, generatePersonalizedExplanation } from './contextual-analyzer'
import { CategoryKey } from '@/config/app'

export interface RankedSpecialist {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  slug: string
  category: string
  specializations: string[]
  tagline?: string
  yearsOfPractice?: number
  workFormats: string[]
  city?: string
  priceFrom?: number
  priceTo?: number
  verified: boolean
  personalizationScore: number
  matchReasons: string[]
  personalizedExplanation: string
  distance?: number
  similarity?: number
}

export interface PersonalizedSearchParams {
  query: string
  category?: CategoryKey
  workFormats?: string[]
  city?: string
  maxPrice?: number
  minExperience?: number
  personalProfile: PersonalProfile
  limit?: number
  excludeIds?: string[]
}

/**
 * Ранжирует специалистов с учётом личного профиля
 */
export function rankSpecialistsByPersonalization(
  specialists: any[],
  personalProfile: PersonalProfile,
  category: CategoryKey,
  extractedParams: any
): RankedSpecialist[] {
  return specialists.map(specialist => {
    // Вычисляем персональный score
    const personalizationScore = calculatePersonalizationScore(specialist, personalProfile, category)
    
    // Генерируем объяснение выбора
    const personalizedExplanation = generatePersonalizedExplanation(specialist, personalProfile, category)
    
    // Формируем причины совпадения
    const matchReasons = generateMatchReasons(specialist, personalProfile, extractedParams)
    
    // Вычисляем similarity если есть distance
    const similarity = specialist.distance !== undefined ? Math.round((1 - specialist.distance) * 100) : null
    
    return {
      id: specialist.id,
      firstName: specialist.firstName,
      lastName: specialist.lastName,
      avatar: specialist.avatar,
      slug: specialist.slug,
      category: specialist.category,
      specializations: specialist.specializations,
      tagline: specialist.tagline,
      yearsOfPractice: specialist.yearsOfPractice,
      workFormats: specialist.workFormats,
      city: specialist.city,
      priceFrom: specialist.priceFrom,
      priceTo: specialist.priceTo,
      verified: specialist.verified,
      personalizationScore: personalizationScore.overall,
      matchReasons,
      personalizedExplanation,
      distance: specialist.distance,
      similarity
    }
  }).sort((a, b) => {
    // Сортируем по персональному score (приоритет), затем по similarity
    if (b.personalizationScore !== a.personalizationScore) {
      return b.personalizationScore - a.personalizationScore
    }
    
    if (b.similarity && a.similarity) {
      return b.similarity - a.similarity
    }
    
    return 0
  })
}

/**
 * Генерирует причины совпадения специалиста с профилем
 */
function generateMatchReasons(
  specialist: any,
  personalProfile: PersonalProfile,
  extractedParams: any
): string[] {
  const reasons: string[] = []
  
  // Совпадение по категории
  if (extractedParams.category) {
    reasons.push(`Категория: ${getCategoryName(extractedParams.category)}`)
  }
  
  // Совпадение по специализациям
  if (specialist.specializations && specialist.specializations.length > 0) {
    reasons.push(`Специализации: ${specialist.specializations.slice(0, 3).join(', ')}`)
  }
  
  // Совпадение по формату работы
  if (extractedParams.workFormats && extractedParams.workFormats.length > 0) {
    const formats = extractedParams.workFormats.map(f => f === 'online' ? 'Онлайн' : 'Оффлайн').join(', ')
    reasons.push(`Формат: ${formats}`)
  }
  
  // Совпадение по городу
  if (specialist.city && extractedParams.city) {
    reasons.push(`Город: ${specialist.city}`)
  }
  
  // Персональные совпадения
  if (personalProfile.gender === 'male' && extractedParams.category === 'fitness') {
    reasons.push('Опыт работы с мужчинами')
  } else if (personalProfile.gender === 'female' && extractedParams.category === 'psychology') {
    reasons.push('Комфортная работа с женщинами')
  }
  
  // Совпадение по опыту
  if (specialist.yearsOfPractice && extractedParams.minExperience) {
    if (specialist.yearsOfPractice >= extractedParams.minExperience) {
      reasons.push(`Опыт: ${specialist.yearsOfPractice} лет`)
    }
  }
  
  // Совпадение по возрасту пользователя
  if (personalProfile.age === 'young' && specialist.yearsOfPractice && specialist.yearsOfPractice < 10) {
    reasons.push('Современные подходы для молодых')
  } else if (personalProfile.age === 'mature' && specialist.yearsOfPractice && specialist.yearsOfPractice > 10) {
    reasons.push('Опытный специалист для зрелых клиентов')
  }
  
  return reasons
}

/**
 * Генерирует персонализированные объяснения для результатов поиска
 */
export function generatePersonalizedSearchExplanation(
  specialists: RankedSpecialist[],
  personalProfile: PersonalProfile,
  category: CategoryKey
): string {
  if (specialists.length === 0) {
    return 'К сожалению, подходящих специалистов не найдено.'
  }
  
  const topSpecialist = specialists[0]
  const explanations: string[] = []
  
  // Объяснение выбора топового специалиста
  explanations.push(`Подобрал ${specialists.length} специалист${specialists.length > 1 ? 'ов' : 'а'} с учётом ваших личных данных.`)
  
  // Персональные рекомендации
  if (personalProfile.gender === 'male' && category === 'fitness') {
    explanations.push('💪 Учитывал, что мужчинам обычно больше подходят силовые тренировки.')
  } else if (personalProfile.gender === 'female' && category === 'psychology') {
    explanations.push('👩 Учитывал, что женщинам часто комфортнее с женщинами-психологами.')
  }
  
  if (personalProfile.age === 'young') {
    explanations.push('🥗 Подбирал специалистов с современными подходами.')
  } else if (personalProfile.age === 'mature') {
    explanations.push('🧠 Выбирал опытных специалистов с многолетней практикой.')
  }
  
  if (personalProfile.experience === 'none') {
    explanations.push('🌟 Учитывал, что вам нужен терпеливый специалист для новичков.')
  }
  
  return explanations.join(' ')
}

/**
 * Получает название категории
 */
function getCategoryName(key: string): string {
  const categories: Record<string, string> = {
    psychology: 'Психология и терапия',
    fitness: 'Фитнес и спорт',
    nutrition: 'Питание и диетология',
    massage: 'Массаж и телесные практики',
    coaching: 'Коучинг и развитие',
    medicine: 'Медицина',
  }
  return categories[key] || key
}

/**
 * Анализирует качество персонализации
 */
export function analyzePersonalizationQuality(
  specialists: RankedSpecialist[],
  personalProfile: PersonalProfile
): {
  averagePersonalizationScore: number
  qualityLevel: 'low' | 'medium' | 'high'
  recommendations: string[]
} {
  if (specialists.length === 0) {
    return {
      averagePersonalizationScore: 0,
      qualityLevel: 'low',
      recommendations: ['Попробуйте расширить критерии поиска']
    }
  }
  
  const averageScore = specialists.reduce((sum, s) => sum + s.personalizationScore, 0) / specialists.length
  
  let qualityLevel: 'low' | 'medium' | 'high'
  let recommendations: string[] = []
  
  if (averageScore >= 80) {
    qualityLevel = 'high'
    recommendations = ['Отличное совпадение! Рекомендации учитывают ваши личные данные.']
  } else if (averageScore >= 60) {
    qualityLevel = 'medium'
    recommendations = [
      'Хорошее совпадение. Можете уточнить критерии для лучшего подбора.',
      'Попробуйте указать предпочтения по полу или возрасту специалиста.'
    ]
  } else {
    qualityLevel = 'low'
    recommendations = [
      'Совпадение не идеальное. Рекомендую расширить критерии поиска.',
      'Попробуйте убрать ограничения по опыту или цене.',
      'Укажите больше личных предпочтений для лучшего подбора.'
    ]
  }
  
  return {
    averagePersonalizationScore: Math.round(averageScore),
    qualityLevel,
    recommendations
  }
}
