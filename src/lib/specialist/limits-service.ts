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
        contactViewsAvailable: totalBalance, // 1 балл = 1 просмотр контакта
        requestsAvailable: Math.floor(totalBalance / 10), // 10 баллов = 1 заявка
        isVisible: totalBalance > 0 // Профиль видим, если есть баллы
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
   */
  static async canUseContactView(specialistId: string): Promise<{ allowed: boolean; remaining: number }> {
    const limits = await this.getSpecialistLimits(specialistId)
    if (!limits) {
      return { allowed: false, remaining: 0 }
    }

    return {
      allowed: limits.contactViewsAvailable > 0,
      remaining: limits.contactViewsAvailable
    }
  }

  /**
   * Использовать просмотр контакта (списать 1 балл)
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

      // Списываем 1 балл за просмотр контакта
      try {
        await PointsService.deductPoints(
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
   */
  static async canUseRequest(specialistId: string): Promise<{ allowed: boolean; remaining: number }> {
    const limits = await this.getSpecialistLimits(specialistId)
    if (!limits) {
      return { allowed: false, remaining: 0 }
    }

    return {
      allowed: limits.requestsAvailable > 0,
      remaining: limits.requestsAvailable
    }
  }

  /**
   * Использовать заявку (списать 10 баллов)
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

      // Списываем 10 баллов за заявку
      try {
        await PointsService.deductPoints(
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
   * Проверить видимость профиля (есть ли баллы)
   */
  static async isProfileVisible(specialistId: string): Promise<boolean> {
    const limits = await this.getSpecialistLimits(specialistId)
    const isVisible = limits ? limits.isVisible : false
    
    // Логируем для отладки
    console.log(`[Visibility Check] Specialist ${specialistId}: ${limits?.totalPoints || 0} баллов, видим: ${isVisible}`)
    
    return isVisible
  }

  /**
   * Получить только видимых специалистов
   */
  static async getVisibleSpecialists(filters: any = {}) {
    try {
      const specialists = await prisma.specialistProfile.findMany({
        where: {
          acceptingClients: true,
          ...filters // Используем переданные фильтры вместо жестко заданных
        },
        include: {
          user: true
        }
      })

      // Фильтруем по видимости
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
