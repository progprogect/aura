/**
 * Генерация и работа с embeddings
 */

import { openai, MODELS } from './openai'
import { prisma } from '@/lib/db'
import { saveEmbedding } from './mongodb-client'

/**
 * Генерирует embedding для специалиста (Unified)
 */
export async function generateSpecialistEmbedding(specialistProfileId: string) {
  const specialistProfile = await prisma.specialistProfile.findUnique({
    where: { id: specialistProfileId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        }
      }
    }
  })

  if (!specialistProfile) {
    throw new Error(`SpecialistProfile ${specialistProfileId} not found`)
  }

  // Объединяем данные для совместимости
  const specialist = {
    ...specialistProfile,
    firstName: specialistProfile.user.firstName,
    lastName: specialistProfile.user.lastName,
  }

  // Формируем текст для embedding
  const sourceText = buildSpecialistText(specialist)

  console.log(`[Embeddings] Generating for ${specialist.firstName} ${specialist.lastName}...`)

  // Генерируем embedding через OpenAI
  const response = await openai.embeddings.create({
    model: MODELS.EMBEDDING,
    input: sourceText,
  })

  const embedding = response.data[0].embedding

  // Сохраняем в MongoDB (с категорией для фильтрации!)
  await saveEmbedding(specialistProfileId, specialist.category, embedding, sourceText, MODELS.EMBEDDING)

  console.log(`[Embeddings] ✓ Saved for ${specialist.firstName} ${specialist.lastName}`)

  return embedding
}

/**
 * Формирует текст для embedding из данных специалиста
 * ВАЖНО: Порядок и повторение влияют на вес в semantic search!
 */
function buildSpecialistText(specialist: any): string {
  const parts: string[] = []

  // 1. КРИТИЧНО: Проблемы с которыми работает (максимальный вес!)
  if (specialist.customFields) {
    const cf = specialist.customFields as any
    if (cf.worksWith && Array.isArray(cf.worksWith) && cf.worksWith.length > 0) {
      // Дублируем 3 раза для увеличения веса в embedding!
      parts.push(`Работает с проблемами: ${cf.worksWith.join(', ')}`)
      parts.push(`Специализация на проблемах: ${cf.worksWith.join(', ')}`)
      parts.push(`Помогает с: ${cf.worksWith.join(', ')}`)
    }
  }

  // 2. КРИТИЧНО: Описание специалиста (увеличиваем вес!)
  if (specialist.about && specialist.about.length > 10) {
    parts.push(`О специалисте: ${specialist.about}`)
    // Дублируем описание для увеличения веса
    parts.push(`Описание работы: ${specialist.about}`)
  }

  // 3. Специализации (важно)
  if (specialist.specializations && specialist.specializations.length > 0) {
    parts.push(`Специализации: ${specialist.specializations.join(', ')}`)
  }

  // 4. Слоган/подход
  if (specialist.tagline) {
    parts.push(`Подход: ${specialist.tagline}`)
  }

  // 5. Методы работы (важно для matching)
  if (specialist.customFields) {
    const cf = specialist.customFields as any
    
    if (cf.methods && Array.isArray(cf.methods) && cf.methods.length > 0) {
      parts.push(`Методы работы: ${cf.methods.join(', ')}`)
    }

    if (cf.approaches && Array.isArray(cf.approaches) && cf.approaches.length > 0) {
      parts.push(`Подходы: ${cf.approaches.join(', ')}`)
    }

    if (cf.trainingTypes && Array.isArray(cf.trainingTypes)) {
      parts.push(`Типы тренировок: ${cf.trainingTypes.join(', ')}`)
    }

    if (cf.specializations && Array.isArray(cf.specializations)) {
      parts.push(`Дополнительные специализации: ${cf.specializations.join(', ')}`)
    }
  }

  // 6. Базовая информация
  parts.push(`Специалист: ${specialist.firstName} ${specialist.lastName}`)
  parts.push(`Категория: ${getCategoryName(specialist.category)}`)

  // 7. Опыт
  if (specialist.yearsOfPractice) {
    parts.push(`Опыт работы: ${specialist.yearsOfPractice} лет`)
  }

  // 8. Форматы работы
  parts.push(`Форматы работы: ${specialist.workFormats.map(formatWorkFormat).join(', ')}`)

  // 9. Локация
  if (specialist.city) {
    parts.push(`Город: ${specialist.city}`)
  }

  return parts.join('\n')
}

/**
 * Генерирует embedding для пользовательского запроса
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: MODELS.EMBEDDING,
    input: query,
  })

  return response.data[0].embedding
}

/**
 * Генерирует embeddings для всех специалистов (batch) (Unified)
 */
export async function generateAllEmbeddings() {
  const specialistProfiles = await prisma.specialistProfile.findMany({
    where: { 
      acceptingClients: true,
      verified: true, // Всегда требуем верификацию
    },
    select: { 
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        }
      }
    },
  })

  console.log(`[Embeddings] Starting generation for ${specialistProfiles.length} specialists...`)

  let successCount = 0
  let errorCount = 0

  for (const profile of specialistProfiles) {
    try {
      await generateSpecialistEmbedding(profile.id)
      successCount++
    } catch (error) {
      console.error(`[Embeddings] Error for ${profile.user.firstName} ${profile.user.lastName}:`, error)
      errorCount++
    }

    // Rate limiting: не более 3000 requests/min для tier 1
    // Ждём 20ms между запросами = 3000/min
    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  console.log(`[Embeddings] Completed: ${successCount} success, ${errorCount} errors`)

  return { successCount, errorCount, total: specialistProfiles.length }
}

// ========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ========================================

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

function formatWorkFormat(format: string): string {
  const formats: Record<string, string> = {
    online: 'онлайн',
    offline: 'оффлайн',
    hybrid: 'гибрид',
  }
  return formats[format] || format
}

