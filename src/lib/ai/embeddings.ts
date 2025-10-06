/**
 * Генерация и работа с embeddings
 */

import { openai, MODELS } from './openai'
import { prisma } from '@/lib/db'
import { saveEmbedding } from './mongodb-client'

/**
 * Генерирует embedding для специалиста
 */
export async function generateSpecialistEmbedding(specialistId: string) {
  const specialist = await prisma.specialist.findUnique({
    where: { id: specialistId },
  })

  if (!specialist) {
    throw new Error(`Specialist ${specialistId} not found`)
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

  // Сохраняем в MongoDB
  await saveEmbedding(specialistId, embedding, sourceText, MODELS.EMBEDDING)

  console.log(`[Embeddings] ✓ Saved for ${specialist.firstName} ${specialist.lastName}`)

  return embedding
}

/**
 * Формирует текст для embedding из данных специалиста
 */
function buildSpecialistText(specialist: any): string {
  const parts: string[] = []

  // Основная информация
  parts.push(`Специалист: ${specialist.firstName} ${specialist.lastName}`)
  parts.push(`Категория: ${getCategoryName(specialist.category)}`)

  // Специализации
  if (specialist.specializations && specialist.specializations.length > 0) {
    parts.push(`Специализации: ${specialist.specializations.join(', ')}`)
  }

  // Описание
  parts.push(`О специалисте: ${specialist.about}`)

  // Слоган/тэглайн
  if (specialist.tagline) {
    parts.push(`Подход: ${specialist.tagline}`)
  }

  // Кастомные поля (методы, проблемы, подходы)
  if (specialist.customFields) {
    const cf = specialist.customFields as any

    if (cf.methods && Array.isArray(cf.methods)) {
      parts.push(`Методы работы: ${cf.methods.join(', ')}`)
    }

    if (cf.worksWith && Array.isArray(cf.worksWith)) {
      parts.push(`Работает с проблемами: ${cf.worksWith.join(', ')}`)
    }

    if (cf.approaches && Array.isArray(cf.approaches)) {
      parts.push(`Подходы: ${cf.approaches.join(', ')}`)
    }

    if (cf.trainingTypes && Array.isArray(cf.trainingTypes)) {
      parts.push(`Типы тренировок: ${cf.trainingTypes.join(', ')}`)
    }

    if (cf.specializations && Array.isArray(cf.specializations)) {
      parts.push(`Дополнительные специализации: ${cf.specializations.join(', ')}`)
    }
  }

  // Опыт
  if (specialist.yearsOfPractice) {
    parts.push(`Опыт работы: ${specialist.yearsOfPractice} лет`)
  }

  // Форматы работы
  parts.push(`Форматы работы: ${specialist.workFormats.map(formatWorkFormat).join(', ')}`)

  // Локация
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
 * Генерирует embeddings для всех специалистов (batch)
 */
export async function generateAllEmbeddings() {
  const specialists = await prisma.specialist.findMany({
    where: { acceptingClients: true },
    select: { id: true, firstName: true, lastName: true },
  })

  console.log(`[Embeddings] Starting generation for ${specialists.length} specialists...`)

  let successCount = 0
  let errorCount = 0

  for (const specialist of specialists) {
    try {
      await generateSpecialistEmbedding(specialist.id)
      successCount++
    } catch (error) {
      console.error(`[Embeddings] Error for ${specialist.firstName} ${specialist.lastName}:`, error)
      errorCount++
    }

    // Rate limiting: не более 3000 requests/min для tier 1
    // Ждём 20ms между запросами = 3000/min
    await new Promise((resolve) => setTimeout(resolve, 20))
  }

  console.log(`[Embeddings] Completed: ${successCount} success, ${errorCount} errors`)

  return { successCount, errorCount, total: specialists.length }
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

