/**
 * Утилиты для инвалидации кеша Next.js ISR
 * Используется после изменений профиля специалиста
 */

import { revalidatePath } from 'next/cache'

/**
 * Инвалидация кеша страницы профиля специалиста
 * Вызывать после любых изменений профиля, лид-магнитов, образования и т.д.
 */
export async function revalidateSpecialistProfile(slug: string) {
  try {
    // Инвалидируем страницу профиля
    revalidatePath(`/specialist/${slug}`, 'page')
    
    // Инвалидируем каталог (список специалистов мог измениться)
    revalidatePath('/catalog', 'page')
    
    console.log(`[Revalidation] ✅ Кеш обновлен для /specialist/${slug}`)
  } catch (error) {
    // Не ломаем запрос если revalidation упал
    console.error('[Revalidation] ⚠️ Ошибка инвалидации кеша:', error)
  }
}

/**
 * Инвалидация кеша страницы лид-магнита
 */
export async function revalidateLeadMagnet(specialistSlug: string, leadMagnetSlug: string) {
  try {
    // Инвалидируем страницу лид-магнита
    revalidatePath(`/specialist/${specialistSlug}/resources/${leadMagnetSlug}`, 'page')
    
    // Инвалидируем профиль (список лид-магнитов изменился)
    revalidatePath(`/specialist/${specialistSlug}`, 'page')
    
    console.log(`[Revalidation] ✅ Кеш обновлен для лид-магнита ${leadMagnetSlug}`)
  } catch (error) {
    console.error('[Revalidation] ⚠️ Ошибка инвалидации кеша:', error)
  }
}

