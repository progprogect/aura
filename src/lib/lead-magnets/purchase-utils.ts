/**
 * Утилиты для проверки покупки лид-магнитов
 */

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/server'

/**
 * Проверить, купил ли пользователь лид-магнит
 * 
 * @param leadMagnetId - ID лид-магнита
 * @param priceInPoints - Цена лид-магнита (null или 0 = бесплатный)
 * @returns true если пользователь купил или лид-магнит бесплатный, false иначе
 */
export async function checkPurchaseStatus(
  leadMagnetId: string,
  priceInPoints: number | null
): Promise<boolean> {
  try {
    // Если лид-магнит бесплатный - считаем как "куплен"
    if (priceInPoints === null || priceInPoints === 0) {
      return true
    }

    // Получаем текущего пользователя (опционально, не ломает для неавторизованных)
    const user = await getCurrentUser()
    
    if (!user) {
      return false
    }

    // Проверяем наличие покупки
    const purchase = await prisma.leadMagnetPurchase.findFirst({
      where: {
        leadMagnetId,
        userId: user.id
      }
    })

    return !!purchase
  } catch (error) {
    // В случае ошибки возвращаем false (безопасный fallback)
    console.error('[checkPurchaseStatus] Ошибка проверки покупки:', error)
    return false
  }
}

