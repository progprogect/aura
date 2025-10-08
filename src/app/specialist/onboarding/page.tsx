/**
 * Страница онбординга для новых специалистов
 * Показывается после регистрации
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { OnboardingWizard } from '@/components/specialist/onboarding/OnboardingWizard'

export const metadata = {
  title: 'Создание профиля | Аура',
  description: 'Создайте свой профиль специалиста',
  robots: 'noindex, nofollow',
}

async function getSpecialist() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')?.value

  if (!sessionToken) {
    return null
  }

  const session = await prisma.authSession.findFirst({
    where: {
      sessionToken,
      expiresAt: { gt: new Date() }
    },
    include: {
      specialist: true
    }
  })

  return session?.specialist || null
}

export default async function OnboardingPage() {
  const specialist = await getSpecialist()

  // Middleware уже проверил авторизацию, поэтому specialist всегда существует здесь
  if (!specialist) {
    // Это не должно происходить благодаря middleware, но на всякий случай
    redirect('/auth/login')
  }

  // Если профиль уже заполнен → на dashboard
  if (specialist.firstName && specialist.lastName && specialist.about) {
    redirect('/specialist/dashboard')
  }

  return <OnboardingWizard initialPhone={specialist.phone || ''} />
}

