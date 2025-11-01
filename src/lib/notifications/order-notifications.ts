/**
 * Унифицированные уведомления для заказов
 * Общая функция для уведомления специалиста о новом заказе (прямая покупка или через заявку)
 */

import { prisma } from '@/lib/db'
import { sendSMS } from '@/lib/auth/sms-service'

/**
 * Уведомление специалисту о новом заказе
 * Используется как для прямой покупки, так и для покупки через заявку
 */
export async function notifySpecialistAboutNewOrder(
  specialistUserId: string,
  clientName: string,
  orderTitle: string,
  orderPrice: number
) {
  try {
    const specialist = await prisma.user.findUnique({
      where: { id: specialistUserId },
      select: { phone: true, firstName: true }
    })

    if (!specialist || !specialist.phone) {
      return { success: false, error: 'Телефон специалиста не найден' }
    }

    const message = `Новый заказ от ${clientName}: "${orderTitle}". Сумма: ${orderPrice} баллов.`
    
    await sendSMS({
      phone: specialist.phone,
      purpose: 'notification' as any
    })
    
    // TODO: Реальная отправка SMS с сообщением
    console.log(`[SMS] Отправка специалисту ${specialist.phone}: ${message}`)

    return { success: true }
  } catch (error) {
    console.error('[notifications] Ошибка уведомления специалиста о новом заказе:', error)
    return { success: false, error: String(error) }
  }
}

