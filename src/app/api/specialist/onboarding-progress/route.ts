import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { prisma } from '@/lib/db'

const updateSchema = z.object({
  step: z.number().int().min(0).max(4).optional(),
  completed: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  const session = await getAuthSession(request)

  if (!session) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
  }

  if (!session.specialistProfile) {
    return NextResponse.json(
      { success: false, error: 'Профиль специалиста не найден' },
      { status: 404 }
    )
  }

  const profile = await prisma.specialistProfile.findUnique({
    where: { id: session.specialistProfile.id },
    select: {
      onboardingStep: true,
      onboardingCompletedAt: true,
    },
  })

  if (!profile) {
    return NextResponse.json(
      { success: false, error: 'Профиль специалиста не найден' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    step: profile.onboardingStep ?? 0,
    completedAt: profile.onboardingCompletedAt,
  })
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession(request)

  if (!session) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
  }

  if (!session.specialistProfile) {
    return NextResponse.json(
      { success: false, error: 'Профиль специалиста не найден' },
      { status: 404 }
    )
  }

  const body = await request.json()

  const { step, completed } = updateSchema.parse(body)

  const updateData: {
    onboardingStep?: number
    onboardingCompletedAt?: Date | null
  } = {}

  if (typeof step === 'number') {
    updateData.onboardingStep = step
  }

  if (completed === true) {
    updateData.onboardingCompletedAt = new Date()
  } else if (completed === false) {
    updateData.onboardingCompletedAt = null
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { success: false, error: 'Нет данных для обновления' },
      { status: 400 }
    )
  }

  const profile = await prisma.specialistProfile.update({
    where: { id: session.specialistProfile.id },
    data: updateData,
    select: {
      onboardingStep: true,
      onboardingCompletedAt: true,
    },
  })

  return NextResponse.json({
    success: true,
    step: profile.onboardingStep ?? 0,
    completedAt: profile.onboardingCompletedAt,
  })
}


