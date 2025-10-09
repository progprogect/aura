/**
 * Dashboard специалиста
 * Показывается после входа
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { DashboardStats } from '@/components/specialist/dashboard/DashboardStats'
import { ProfileCompletionCard } from '@/components/specialist/dashboard/ProfileCompletionCard'
import { QuickActions } from '@/components/specialist/dashboard/QuickActions'

export const metadata = {
  title: 'Личный кабинет | Аура',
  description: 'Управление профилем специалиста',
  robots: 'noindex, nofollow',
}

async function getDashboardData() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')?.value

  if (!sessionToken) {
    return null
  }

  // Прямой запрос к БД вместо fetch (эффективнее на сервере)
  const authSession = await prisma.authSession.findFirst({
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

  if (!authSession || !authSession.user.specialistProfile) {
    return null
  }

  const user = authSession.user
  const profile = user.specialistProfile

  if (!profile) {
    return null
  }

  // Получаем полные данные профиля
  const fullProfile = await prisma.specialistProfile.findUnique({
    where: { id: profile.id },
    include: {
      education: true,
      certificates: true,
      gallery: true,
      faqs: true,
      leadMagnets: {
        where: { isActive: true }
      },
    }
  })

  if (!fullProfile) {
    return null
  }

  // Формируем полный объект специалиста
  const specialist = {
    id: fullProfile.id,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    slug: fullProfile.slug,
    category: fullProfile.category,
    specializations: fullProfile.specializations,
    verified: fullProfile.verified,
    profileViews: fullProfile.profileViews,
    contactViews: fullProfile.contactViews,
    acceptingClients: fullProfile.acceptingClients,
    tagline: fullProfile.tagline,
    about: fullProfile.about,
    city: fullProfile.city,
    email: user.email,
    priceFrom: fullProfile.priceFrom,
    priceTo: fullProfile.priceTo,
    yearsOfPractice: fullProfile.yearsOfPractice,
    videoUrl: fullProfile.videoUrl,
    education: fullProfile.education,
    certificates: fullProfile.certificates,
    gallery: fullProfile.gallery,
    faqs: fullProfile.faqs,
    leadMagnets: fullProfile.leadMagnets,
  }

  // Подсчёт процента заполнения
  const completionFields = {
    firstName: specialist.firstName ? 1 : 0,
    lastName: specialist.lastName ? 1 : 0,
    about: specialist.about ? 1 : 0,
    specializations: specialist.specializations.length > 0 ? 1 : 0,
    avatar: specialist.avatar ? 15 : 0,
    tagline: specialist.tagline ? 5 : 0,
    city: specialist.city ? 5 : 0,
    email: specialist.email ? 5 : 0,
    prices: (specialist.priceFrom || specialist.priceTo) ? 10 : 0,
    yearsOfPractice: specialist.yearsOfPractice ? 5 : 0,
    education: specialist.education.length > 0 ? 15 : 0,
    certificates: specialist.certificates.length > 0 ? 20 : 0,
    gallery: specialist.gallery.length > 0 ? 10 : 0,
    faqs: specialist.faqs.length > 0 ? 5 : 0,
    video: specialist.videoUrl ? 10 : 0,
    leadMagnets: specialist.leadMagnets.length > 0 ? 10 : 0,
  }

  const baseCompletion = 20
  const additionalCompletion = Object.values(completionFields).reduce((sum, val) => sum + val, 0) - 4
  const completionPercentage = Math.min(100, baseCompletion + additionalCompletion)

  // Количество заявок за неделю
  const consultationRequestsCount = await prisma.consultationRequest.count({
    where: {
      specialistProfileId: specialist.id,
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  })

  // Количество новых (непрочитанных) заявок
  const newRequestsCount = await prisma.consultationRequest.count({
    where: {
      specialistProfileId: specialist.id,
      status: 'new'
    }
  })

  // Формируем задания
  const tasks = []
  
  if (!specialist.avatar) {
    tasks.push({
      id: 'avatar',
      title: 'Добавьте фото профиля',
      description: 'Профиль с фото вызывает больше доверия',
      bonus: 15,
      completed: false
    })
  }
  
  if (specialist.certificates.length === 0) {
    tasks.push({
      id: 'certificates',
      title: 'Загрузите сертификаты',
      description: 'Подтвердите свою квалификацию',
      bonus: 20,
      completed: false
    })
  }
  
  if (specialist.education.length === 0) {
    tasks.push({
      id: 'education',
      title: 'Добавьте образование',
      description: 'Укажите ваше профессиональное образование',
      bonus: 15,
      completed: false
    })
  }
  
  if (specialist.gallery.length === 0) {
    tasks.push({
      id: 'gallery',
      title: 'Создайте галерею',
      description: 'Добавьте фото вашего кабинета или процесса работы',
      bonus: 10,
      completed: false
    })
  }
  
  if (!specialist.priceFrom && !specialist.priceTo) {
    tasks.push({
      id: 'pricing',
      title: 'Укажите цены',
      description: 'Клиентам важно знать стоимость заранее',
      bonus: 10,
      completed: false
    })
  }

  if (!specialist.videoUrl) {
    tasks.push({
      id: 'video',
      title: 'Добавьте видео-презентацию',
      description: 'Видео помогает клиентам познакомиться с вами',
      bonus: 10,
      completed: false
    })
  }

  if (specialist.leadMagnets.length === 0) {
    tasks.push({
      id: 'leadMagnets',
      title: 'Создайте лид-магниты',
      description: 'Привлекайте клиентов бесплатными материалами',
      bonus: 10,
      completed: false
    })
  }

  return {
    success: true,
    specialist: {
      id: specialist.id,
      firstName: specialist.firstName,
      lastName: specialist.lastName,
      avatar: specialist.avatar,
      slug: specialist.slug,
      category: specialist.category,
      specializations: specialist.specializations,
      verified: specialist.verified,
      acceptingClients: specialist.acceptingClients,
      about: specialist.about,
    },
    stats: {
      profileViews: specialist.profileViews,
      contactViews: specialist.contactViews,
      consultationRequests: consultationRequestsCount,
      completionPercentage,
    },
    newRequestsCount,
    tasks
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  // Если не авторизован → на страницу входа
  if (!data || !data.success) {
    redirect('/auth/login')
  }

  const { specialist, stats, tasks, newRequestsCount } = data

  // Если профиль не заполнен → на онбординг
  // Проверяем основные поля (firstName, lastName, about)
  if (!specialist.firstName || !specialist.lastName || !specialist.about || specialist.about.trim() === '') {
    redirect('/specialist/onboarding')
  }

  const fullName = `${specialist.firstName} ${specialist.lastName}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Приветствие */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            👋 Привет, {specialist.firstName}!
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Добро пожаловать в личный кабинет специалиста
          </p>
        </div>

        {/* Статистика */}
        <div className="mb-6">
          <DashboardStats
            profileViews={stats.profileViews}
            contactViews={stats.contactViews}
            consultationRequests={stats.consultationRequests}
          />
        </div>

        {/* Контент grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка (2/3 на десктопе) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Прогресс профиля */}
            <ProfileCompletionCard
              completionPercentage={stats.completionPercentage}
              tasks={tasks}
            />
          </div>

          {/* Правая колонка (1/3 на десктопе) */}
          <div className="space-y-6">
            {/* Быстрые действия */}
            <QuickActions 
              slug={specialist.slug}
              newRequestsCount={newRequestsCount}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

