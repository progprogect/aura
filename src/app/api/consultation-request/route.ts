import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ConsultationRequestSchema } from '@/lib/validations/api'
import { SpecialistLimitsService } from '@/lib/specialist/limits-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Валидация входных данных
    const validationResult = ConsultationRequestSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Некорректные данные запроса', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }
    
    const { specialistId, name, contact, message } = validationResult.data

    // Проверяем, что специалист существует (specialistId теперь = specialistProfileId)
    const specialistProfile = await prisma.specialistProfile.findUnique({
      where: { id: specialistId },
    })

    if (!specialistProfile) {
      return NextResponse.json({ error: 'Специалист не найден' }, { status: 404 })
    }

    // Проверяем, может ли специалист получить заявку
    // Для входящих операций всегда разрешаем (может быть отрицательный баланс)
    const canUse = await SpecialistLimitsService.canUseRequest(specialistId)
    if (!canUse.allowed) {
      return NextResponse.json({ 
        error: 'Специалист не может получать заявки'
      }, { status: 400 })
    }

    // Списываем 10 баллов за получение заявки
    const used = await SpecialistLimitsService.consumeRequest(specialistId)
    if (!used) {
      return NextResponse.json({ 
        error: 'Ошибка списания баллов за заявку' 
      }, { status: 500 })
    }

    // Создаем запрос на консультацию
    const consultationRequest = await prisma.consultationRequest.create({
      data: {
        specialistProfileId: specialistId,
        name,
        contact,
        message: message || null,
        status: 'new',
      },
    })

    console.log(`✅ Специалист ${specialistId} получил заявку ${consultationRequest.id} (списано 10 баллов)`)

    // TODO: Отправить уведомление специалисту (email/telegram)

    return NextResponse.json({
      success: true,
      requestId: consultationRequest.id,
    })
  } catch (error) {
    console.error('Error creating consultation request:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при отправке заявки' },
      { status: 500 }
    )
  }
}



