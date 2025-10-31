/**
 * Сервис SMS уведомлений для системы заявок
 */

import { prisma } from '@/lib/db'
// TODO: Интегрировать реальную отправку SMS уведомлений
// Пока используем console.log для логирования

interface NotificationOptions {
  requestTitle?: string
  specialistName?: string
  userName?: string
  price?: number
}

/**
 * Уведомление специалистам о новой заявке в их категории
 */
export async function notifySpecialistsAboutNewRequest(
  category: string,
  requestTitle: string,
  requestId: string
) {
  try {
    // Получаем всех специалистов в категории
    const specialists = await prisma.specialistProfile.findMany({
      where: {
        category,
        acceptingClients: true,
        verified: true
      },
      include: {
        user: {
          select: {
            phone: true,
            firstName: true
          }
        }
      }
    })

    // Отправляем SMS каждому специалисту
    for (const specialist of specialists) {
      if (specialist.user.phone) {
        const message = `Новая заявка в вашей категории: "${requestTitle}". Перейдите в приложение для просмотра.`
        
        // TODO: Реальная отправка SMS с сообщением
        // await sendSMS({ phone: specialist.user.phone, message })
        console.log(`[SMS] Отправка специалисту ${specialist.user.phone}: ${message}`)
      }
    }

    return { success: true, notified: specialists.length }
  } catch (error) {
    console.error('[notifications] Ошибка уведомления специалистов:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Уведомление пользователю о новом отклике
 */
export async function notifyUserAboutNewProposal(
  userId: string,
  specialistName: string,
  requestTitle: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true, firstName: true }
    })

    if (!user || !user.phone) {
      return { success: false, error: 'Телефон пользователя не найден' }
    }

    const message = `Новый отклик от ${specialistName} на вашу заявку "${requestTitle}". Проверьте в приложении.`
    
    await sendSMS({
      phone: user.phone,
      purpose: 'notification' as any
    })
    
    // TODO: Реальная отправка SMS с сообщением
    console.log(`[SMS] Отправка пользователю ${user.phone}: ${message}`)

    return { success: true }
  } catch (error) {
    console.error('[notifications] Ошибка уведомления пользователя:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Уведомление специалисту о принятии отклика
 */
export async function notifySpecialistAboutAcceptedProposal(
  specialistUserId: string,
  userName: string,
  requestTitle: string,
  price: number
) {
  try {
    const specialist = await prisma.user.findUnique({
      where: { id: specialistUserId },
      select: { phone: true, firstName: true }
    })

    if (!specialist || !specialist.phone) {
      return { success: false, error: 'Телефон специалиста не найден' }
    }

    const message = `Ваш отклик на заявку "${requestTitle}" принят пользователем ${userName}. Сумма: ${price} баллов.`
    
    await sendSMS({
      phone: specialist.phone,
      purpose: 'notification' as any
    })
    
    // TODO: Реальная отправка SMS с сообщением
    console.log(`[SMS] Отправка специалисту ${specialist.phone}: ${message}`)

    return { success: true }
  } catch (error) {
    console.error('[notifications] Ошибка уведомления специалиста:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Уведомление пользователю о завершении работы специалистом
 */
export async function notifyUserAboutCompletedWork(
  userId: string,
  specialistName: string,
  requestTitle: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true, firstName: true }
    })

    if (!user || !user.phone) {
      return { success: false, error: 'Телефон пользователя не найден' }
    }

    const message = `Специалист ${specialistName} завершил работу по заявке "${requestTitle}". Подтвердите выполнение в приложении.`
    
    await sendSMS({
      phone: user.phone,
      purpose: 'notification' as any
    })
    
    // TODO: Реальная отправка SMS с сообщением
    console.log(`[SMS] Отправка пользователю ${user.phone}: ${message}`)

    return { success: true }
  } catch (error) {
    console.error('[notifications] Ошибка уведомления пользователя:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Уведомление специалисту о подтверждении выполнения пользователем
 */
export async function notifySpecialistAboutConfirmedCompletion(
  specialistUserId: string,
  userName: string,
  requestTitle: string,
  price: number
) {
  try {
    const specialist = await prisma.user.findUnique({
      where: { id: specialistUserId },
      select: { phone: true, firstName: true }
    })

    if (!specialist || !specialist.phone) {
      return { success: false, error: 'Телефон специалиста не найден' }
    }

    const message = `Пользователь ${userName} подтвердил выполнение заявки "${requestTitle}". ${price} баллов переведены на ваш счёт.`
    
    await sendSMS({
      phone: specialist.phone,
      purpose: 'notification' as any
    })
    
    // TODO: Реальная отправка SMS с сообщением
    console.log(`[SMS] Отправка специалисту ${specialist.phone}: ${message}`)

    return { success: true }
  } catch (error) {
    console.error('[notifications] Ошибка уведомления специалиста:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Уведомление специалистам об отмене заявки
 */
export async function notifySpecialistsAboutCancelledRequest(
  requestId: string,
  requestTitle: string
) {
  try {
    // Получаем всех специалистов с откликами на эту заявку
    const proposals = await prisma.proposal.findMany({
      where: {
        requestId,
        status: { in: ['pending', 'accepted'] }
      },
      include: {
        specialist: {
          include: {
            user: {
              select: {
                phone: true
              }
            }
          }
        }
      }
    })

    for (const proposal of proposals) {
      if (proposal.specialist.user.phone) {
        const message = `Заявка "${requestTitle}" была отменена пользователем.`
        
        // TODO: Реальная отправка SMS с сообщением
        // await sendSMS({ phone: proposal.specialist.user.phone, message })
        console.log(`[SMS] Отправка специалисту ${proposal.specialist.user.phone}: ${message}`)
      }
    }

    return { success: true, notified: proposals.length }
  } catch (error) {
    console.error('[notifications] Ошибка уведомления специалистов:', error)
    return { success: false, error: String(error) }
  }
}

