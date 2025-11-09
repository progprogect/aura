/**
 * Страница онбординга для новых специалистов
 * Показывается после регистрации
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { OnboardingWizard } from '@/components/specialist/onboarding/OnboardingWizard'

export const metadata = {
  title: 'Создание профиля | Эколюция 360',
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
      expiresAt: { gt: new Date() },
      isActive: true
    },
    include: {
      user: {
        include: {
          specialistProfile: true
        }
      }
    }
  })

  if (!session || !session.user.specialistProfile) {
    return null
  }

  // Преобразуем в формат старой модели для совместимости
  const user = session.user
  const profile = user.specialistProfile

  if (!profile) {
    return null
  }

  return {
    id: profile.id,
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    phone: user.phone,
    avatar: user.avatar,
    slug: profile.slug,
    category: profile.category,
    specializations: profile.specializations,
    tagline: profile.tagline,
    about: profile.about,
    city: profile.city,
    country: profile.country,
    workFormats: profile.workFormats,
    yearsOfPractice: profile.yearsOfPractice,
  }
}

export default async function OnboardingPage() {
  const specialist = await getSpecialist()

  // Middleware уже проверил авторизацию, поэтому specialist всегда существует здесь
  if (!specialist) {
    // Это не должно происходить благодаря middleware, но на всякий случай
    redirect('/auth/login')
  }

  // Если профиль уже заполнен → на dashboard
  // Проверяем только основные поля (firstName, lastName, about)
  if (specialist.firstName && specialist.lastName && specialist.about && specialist.about.trim() !== '') {
    redirect('/specialist/dashboard')
  }

  return <OnboardingWizard initialPhone={specialist.phone || ''} />
}

