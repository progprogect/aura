import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ConsultationRequestSchema } from '@/lib/validations/api'

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

    // Проверяем, что специалист существует
    const specialist = await prisma.specialist.findUnique({
      where: { id: specialistId },
    })

    if (!specialist) {
      return NextResponse.json({ error: 'Специалист не найден' }, { status: 404 })
    }

    // Создаем запрос на консультацию
    const consultationRequest = await prisma.consultationRequest.create({
      data: {
        specialistId,
        name,
        contact,
        message: message || null,
        status: 'new',
      },
    })

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



