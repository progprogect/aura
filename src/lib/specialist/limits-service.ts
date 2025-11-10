/**
 * Сервис для работы с лимитами специалистов
 * Логика: Баланс баллов = доступные лимиты
 */

import { prisma } from '@/lib/db'
import { PointsService } from '@/lib/points/points-service'
import { Decimal } from 'decimal.js'

export class SpecialistLimitsService {
  /**
   * Проверить баланс баллов специалиста (это и есть лимиты)
   */
  static async getSpecialistLimits(specialistId: string) {
    try {
      const specialist = await prisma.specialistProfile.findUnique({
        where: { id: specialistId },
        include: {
          user: true
        }
      })

      if (!specialist) {
        return null
      }

      // Получаем баланс баллов пользователя
      const balance = await PointsService.getBalance(specialist.userId)
      const totalBalance = balance.total.toNumber()

      const result = {
        specialistId,
        userId: specialist.userId,
        totalBalance,
        contactViewsAvailable: totalBalance, // 1 балл = 1 просмотр контакта (может быть отрицательным)
        requestsAvailable: Math.floor(totalBalance / 10), // 10 баллов = 1 заявка (может быть отрицательным)
        isVisible: totalBalance > 0 // Профиль видим только при положительном балансе
      }

      // Логируем для отладки
      console.log(`[Limits] Specialist ${specialistId}: ${totalBalance} баллов, видим: ${result.isVisible}`)

      return result
    } catch (error) {
      console.error('Ошибка получения лимитов специалиста:', error)
      return null
    }
  }

  /**
   * Проверить, может ли специалист получить просмотр контакта
   * Для входящих операций всегда разрешаем (может быть отрицательный баланс)
   */
  static async canUseContactView(specialistId: string): Promise<{ allowed: boolean; remaining: number }> {
    const limits = await this.getSpecialistLimits(specialistId)
    if (!limits) {
      return { allowed: false, remaining: 0 }
    }

    return {
      allowed: true, // Всегда разрешаем для входящих операций
      remaining: limits.contactViewsAvailable
    }
  }

  /**
   * Использовать просмотр контакта (списать 1 балл)
   * Разрешает отрицательный баланс для входящих операций
   */
  static async consumeContactView(specialistId: string): Promise<boolean> {
    try {
      const specialist = await prisma.specialistProfile.findUnique({
        where: { id: specialistId },
        include: { user: true }
      })

      if (!specialist) {
        return false
      }

      // Списываем 1 балл за просмотр контакта (разрешаем отрицательный баланс)
      try {
        await PointsService.deductPointsForIncoming(
          specialist.userId,
          new Decimal(1),
          'contact_view',
          `Просмотр контакта специалиста ${specialistId}`
        )

        // Обновляем счетчик просмотров контактов в профиле
        await prisma.specialistProfile.update({
          where: { id: specialistId },
          data: {
            contactViews: { increment: 1 }
          }
        })

        return true
      } catch (error) {
        console.error('Ошибка списания баллов за просмотр контакта:', error)
        return false
      }
    } catch (error) {
      console.error('Ошибка использования просмотра контакта:', error)
      return false
    }
  }

  /**
   * Проверить, может ли специалист получить заявку
   * Для входящих операций всегда разрешаем (может быть отрицательный баланс)
   */
  static async canUseRequest(specialistId: string): Promise<{ allowed: boolean; remaining: number }> {
    const limits = await this.getSpecialistLimits(specialistId)
    if (!limits) {
      return { allowed: false, remaining: 0 }
    }

    return {
      allowed: true, // Всегда разрешаем для входящих операций
      remaining: limits.requestsAvailable
    }
  }

  /**
   * Использовать заявку (списать 10 баллов)
   * Разрешает отрицательный баланс для входящих операций
   */
  static async consumeRequest(specialistId: string): Promise<boolean> {
    try {
      const specialist = await prisma.specialistProfile.findUnique({
        where: { id: specialistId },
        include: { user: true }
      })

      if (!specialist) {
        return false
      }

      // Списываем 10 баллов за заявку (разрешаем отрицательный баланс)
      try {
        await PointsService.deductPointsForIncoming(
          specialist.userId,
          new Decimal(10),
          'request_received',
          `Получение заявки специалистом ${specialistId}`
        )
        return true
      } catch (error) {
        console.error('Ошибка списания баллов за заявку:', error)
        return false
      }
    } catch (error) {
      console.error('Ошибка использования заявки:', error)
      return false
    }
  }

  /**
   * Проверить видимость профиля
   * Профиль видим только если специалист:
   * 1. Не заблокирован
   * 2. Принимает клиентов
   * 3. Верифицирован
   * 4. Имеет положительный баланс
   */
  static async isProfileVisible(specialistId: string): Promise<boolean> {
    try {
      const specialist = await prisma.specialistProfile.findUnique({
        where: { id: specialistId },
        include: { user: true }
      })

      if (!specialist) {
        return false
      }

      // Проверяем блокировку профиля специалиста
      if (specialist.blocked) {
        console.log(`[Visibility] Specialist ${specialistId}: профиль заблокирован, скрыт`)
        return false
      }

      if (!specialist.acceptingClients) {
        return false
      }

      if (!specialist.verified) {
        console.log(`[Visibility] Specialist ${specialistId}: не верифицирован, скрыт`)
        return false
      }

      // Проверяем баланс баллов
      const balance = await PointsService.getBalance(specialist.userId)
      const hasPositiveBalance = balance.total.gt(0)
      
      console.log(`[Visibility] Specialist ${specialistId}: баланс ${balance.total.toNumber()}, верифицирован: ${specialist.verified}, заблокирован: ${specialist.blocked}, видим: ${hasPositiveBalance}`)
      
      return hasPositiveBalance
    } catch (error) {
      console.error('Ошибка проверки видимости профиля:', error)
      return false
    }
  }

  /**
   * Получить только видимых специалистов
   * Фильтрует по: не заблокирован, acceptingClients, verified, положительный баланс
   */
  static async getVisibleSpecialists(filters: any = {}) {
    try {
      const specialists = await prisma.specialistProfile.findMany({
        where: {
          ...filters, // Сначала применяем переданные фильтры
          blocked: false, // Профиль не заблокирован
          acceptingClients: true, // Затем добавляем обязательные фильтры
          verified: true, // Всегда требуем верификацию
        },
        include: {
          user: true
        }
      })

      // Фильтруем по видимости (включая проверку баланса)
      const visibleSpecialists = []
      for (const specialist of specialists) {
        if (await this.isProfileVisible(specialist.id)) {
          visibleSpecialists.push(specialist)
        }
      }

      return visibleSpecialists
    } catch (error) {
      console.error('Ошибка получения видимых специалистов:', error)
      return []
    }
  }
}
