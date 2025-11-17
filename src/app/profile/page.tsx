/**
 * УНИФИЦИРОВАННЫЙ ЛИЧНЫЙ КАБИНЕТ
 * Показывает базовую информацию для всех пользователей
 * + дополнительные разделы специалиста, если hasSpecialistProfile === true
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { DashboardStats } from '@/components/specialist/dashboard/DashboardStats'
import { ProfileCompletionCard } from '@/components/specialist/dashboard/ProfileCompletionCard'
import { QuickActions } from '@/components/specialist/dashboard/QuickActions'
import { ServicesList } from '@/components/specialist/dashboard/ServicesList'
import { LeadMagnetsListWrapper } from '@/components/specialist/dashboard/LeadMagnetsListWrapper'
import { LimitsWidget } from '@/components/specialist/dashboard/LimitsWidget'
import { LogoutButton } from '@/components/profile/LogoutButton'
import { BalanceWidgetWrapper } from '@/components/points/BalanceWidgetWrapper'
import { ensureSlugExists } from '@/lib/auth/server'
import { ProfileContentWrapper } from '@/components/specialist/dashboard/ProfileContentWrapper'
import { ProfileSectionWrapper } from '@/components/specialist/dashboard/ProfileSectionWrapper'
import { SpecialistLimitsService } from '@/lib/specialist/limits-service'
import { PointsService } from '@/lib/points/points-service'
import { ProfileHero } from '@/components/specialist/dashboard/ProfileHero'
import { RequestsAlert } from '@/components/specialist/dashboard/RequestsAlert'
import { fromPrismaLeadMagnet } from '@/types/lead-magnet'

async function getUserData() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')?.value

    if (!sessionToken) {
      return null
    }

    const authSession = await prisma.authSession.findFirst({
      where: {
        sessionToken,
        expiresAt: { gt: new Date() },
        isActive: true
      },
      include: {
        user: {
          include: {
            specialistProfile: {
              include: {
                education: true,
                certificates: true,
                gallery: true,
                faqs: true,
                leadMagnets: {
                  where: { isActive: true }
                },
                services: {
                  where: { isActive: true },
                  orderBy: { order: 'asc' }
                },
                orders: {
                  orderBy: { createdAt: 'desc' },
                  take: 5
                }
              }
            }
          }
        }
      }
    })

    if (!authSession) {
      return null
    }

    const user = authSession.user
    const hasSpecialistProfile = !!user.specialistProfile

    // Подсчитываем статистику покупок для всех пользователей
    const purchasesStats = await prisma.order.groupBy({
      by: ['status'],
      where: {
        OR: [
          { clientUserId: user.id },
          { clientContact: user.phone }
        ]
      },
      _count: true
    })

    const purchasesStatusCounts = purchasesStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count
      return acc
    }, {} as Record<string, number>)

    const totalPurchases = purchasesStats.reduce((sum, stat) => sum + stat._count, 0)

    // Базовые данные пользователя
    const userData: any = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      hasSpecialistProfile,
      createdAt: user.createdAt,
      // Статистика покупок для всех пользователей
      purchasesStats: {
        total: totalPurchases,
        paid: purchasesStatusCounts.paid || 0,
        completed: purchasesStatusCounts.completed || 0,
        cancelled: purchasesStatusCounts.cancelled || 0,
        disputed: purchasesStatusCounts.disputed || 0
      }
    }

    // Если специалист - добавляем данные профиля специалиста
    if (hasSpecialistProfile && user.specialistProfile) {
      const profile = user.specialistProfile

      // 🔍 ДИАГНОСТИКА: Проверяем slug
      console.log('[Profile Page] Проверка slug для пользователя:', user.id)
      console.log('[Profile Page] Текущий slug:', profile.slug)
      
      // Проверяем и восстанавливаем slug если нужно
      if (!profile.slug || profile.slug.trim().length === 0) {
        console.warn('[Profile Page] ⚠️ Slug отсутствует! Вызываем ensureSlugExists...')
        const fixedSlug = await ensureSlugExists(user.id)
        if (fixedSlug) {
          profile.slug = fixedSlug
          console.log('[Profile Page] ✅ Slug восстановлен:', fixedSlug)
        } else {
          console.error('[Profile Page] ❌ Не удалось восстановить slug')
        }
      }

      // Подсчёт процента заполнения
      const completionFields = {
        firstName: user.firstName ? 1 : 0,
        lastName: user.lastName ? 1 : 0,
        about: profile.about ? 1 : 0,
        specializations: profile.specializations.length > 0 ? 1 : 0,
        avatar: user.avatar ? 15 : 0,
        tagline: profile.tagline ? 5 : 0,
        city: profile.city ? 5 : 0,
        email: user.email ? 5 : 0,
        prices: (profile.priceFrom || profile.priceTo) ? 10 : 0,
        yearsOfPractice: profile.yearsOfPractice ? 5 : 0,
        education: profile.education.length > 0 ? 15 : 0,
        certificates: profile.certificates.length > 0 ? 20 : 0,
        gallery: profile.gallery.length > 0 ? 10 : 0,
        faqs: profile.faqs.length > 0 ? 5 : 0,
        video: profile.videoUrl ? 10 : 0,
        leadMagnets: profile.leadMagnets.length > 0 ? 10 : 0,
      }

      const baseCompletion = 20
      const additionalCompletion = Object.values(completionFields).reduce((sum, val) => sum + val, 0) - 4
      const completionPercentage = Math.min(100, baseCompletion + additionalCompletion)

      // Количество заявок за неделю
      const consultationRequestsCount = await prisma.consultationRequest.count({
        where: {
          specialistProfileId: profile.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })

      // Количество новых (непрочитанных) заявок
      const newRequestsCount = await prisma.consultationRequest.count({
        where: {
          specialistProfileId: profile.id,
          status: 'new'
        }
      })

      // Количество заказов за неделю
      const ordersCount = await prisma.order.count({
        where: {
          specialistProfileId: profile.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })

      // Количество новых заказов (pending + paid)
      const newOrdersCount = await prisma.order.count({
        where: {
          specialistProfileId: profile.id,
          status: {
            in: ['pending', 'paid']
          }
        }
      })

      // Формируем задания
      const tasks = []
      
      if (!user.avatar) {
        tasks.push({
          id: 'avatar',
          title: 'Добавьте фото профиля',
          description: 'Профиль с фото вызывает больше доверия',
          bonus: 15,
          completed: false
        })
      }
      
      if (profile.certificates.length === 0) {
        tasks.push({
          id: 'certificates',
          title: 'Загрузите сертификаты',
          description: 'Подтвердите свою квалификацию',
          bonus: 20,
          completed: false
        })
      }
      
      if (profile.education.length === 0) {
        tasks.push({
          id: 'education',
          title: 'Добавьте образование',
          description: 'Укажите ваше профессиональное образование',
          bonus: 15,
          completed: false
        })
      }
      
      if (profile.gallery.length === 0) {
        tasks.push({
          id: 'gallery',
          title: 'Создайте галерею',
          description: 'Добавьте фото вашего кабинета или процесса работы',
          bonus: 10,
          completed: false
        })
      }
      
      if (!profile.priceFrom && !profile.priceTo) {
        tasks.push({
          id: 'pricing',
          title: 'Укажите цены',
          description: 'Клиентам важно знать стоимость заранее',
          bonus: 10,
          completed: false
        })
      }

      if (!profile.videoUrl) {
        tasks.push({
          id: 'video',
          title: 'Добавьте видео-презентацию',
          description: 'Видео помогает клиентам познакомиться с вами',
          bonus: 10,
          completed: false
        })
      }

      if (profile.leadMagnets.length === 0) {
        tasks.push({
          id: 'leadMagnets',
          title: 'Создайте лид-магниты',
          description: 'Привлекайте клиентов бесплатными материалами',
          bonus: 10,
          completed: false
        })
      }

      // Вычисляем видимость профиля (проверяет: блокировка, acceptingClients, verified, баланс)
      const isVisible = await SpecialistLimitsService.isProfileVisible(profile.id)
      
      // Получаем баланс для отображения в модальном окне
      const balance = await PointsService.getBalance(user.id)
      const balanceTotal = balance.total.toNumber()

      // Добавляем данные специалиста
      userData.specialistProfile = {
        id: profile.id,
        slug: profile.slug,
        category: profile.category,
        specializations: profile.specializations,
        verified: profile.verified,
        acceptingClients: profile.acceptingClients,
        isVisible, // Видимость профиля (зависит от баланса и других факторов)
        blocked: profile.blocked, // Для модального окна
        visibilityCriteria: {
          notBlocked: !profile.blocked,
          acceptingClients: profile.acceptingClients,
          verified: profile.verified,
          hasPositiveBalance: balanceTotal > 0,
          balance: balanceTotal,
        },
        about: profile.about,
        tagline: profile.tagline,
        city: profile.city,
        priceFrom: profile.priceFrom,
        priceTo: profile.priceTo,
        yearsOfPractice: profile.yearsOfPractice,
        videoUrl: profile.videoUrl,
        profileViews: profile.profileViews,
        contactViews: profile.contactViews,
        onboardingStep: profile.onboardingStep,
        onboardingCompletedAt: profile.onboardingCompletedAt,
        onboardingSeenAt: profile.onboardingSeenAt,
      }

      userData.stats = {
        profileViews: profile.profileViews,
        contactViews: profile.contactViews,
        consultationRequests: consultationRequestsCount,
        orders: ordersCount,
        completionPercentage,
      }

      userData.tasks = tasks
      userData.newRequestsCount = newRequestsCount
      userData.newOrdersCount = newOrdersCount
      userData.services = profile.services
      userData.leadMagnets = profile.leadMagnets.map(lm => fromPrismaLeadMagnet(lm))
      userData.recentOrders = profile.orders
    }

    return userData
  } catch (error) {
    console.error('Ошибка получения пользователя:', error)
    return null
  }
}

export default async function ProfilePage() {
  const user = await getUserData()

  // Если не авторизован → на страницу входа
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Контент */}
      <ProfileSectionWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ProfileHero - заменяет заголовок и аватар */}
          <div className="mb-6">
            <ProfileHero
              firstName={user.firstName}
              lastName={user.lastName}
              avatar={user.avatar}
              hasSpecialistProfile={user.hasSpecialistProfile}
              specialistProfile={user.hasSpecialistProfile && user.specialistProfile ? {
                slug: user.specialistProfile.slug,
                verified: user.specialistProfile.verified,
                acceptingClients: user.specialistProfile.acceptingClients,
                isVisible: user.specialistProfile.isVisible ?? false,
                visibilityCriteria: user.specialistProfile.visibilityCriteria,
              } : undefined}
            />
          </div>

          {/* RequestsAlert - показывается только если есть новые заявки */}
          {(user.newRequestsCount || 0) > 0 && (
            <div className="mb-6">
              <RequestsAlert
                newRequestsCount={user.newRequestsCount || 0}
                specialistSlug={user.hasSpecialistProfile ? user.specialistProfile?.slug : undefined}
                isSpecialist={user.hasSpecialistProfile}
              />
            </div>
          )}
          {user.hasSpecialistProfile && user.specialistProfile && (
            <ProfileContentWrapper
              initialStep={user.specialistProfile.onboardingStep ?? 0}
              initialCompleted={Boolean(user.specialistProfile.onboardingCompletedAt)}
              initialSeen={Boolean(user.specialistProfile.onboardingSeenAt)}
              guideHref="/profile?section=guide"
            />
          )}

        {/* Если специалист - показываем статистику */}
        {user.hasSpecialistProfile && user.stats && (
          <div className="mb-6">
            <DashboardStats
              profileViews={user.stats.profileViews}
              contactViews={user.stats.contactViews}
              consultationRequests={user.stats.consultationRequests}
              orders={user.stats.orders || 0}
            />
          </div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация + Дополнительные секции для специалиста */}
          <div className="lg:col-span-2 space-y-6">
            {/* Если специалист - показываем прогресс профиля */}
            {user.hasSpecialistProfile && user.stats && user.tasks && user.specialistProfile && (
              <ProfileCompletionCard
                completionPercentage={user.stats.completionPercentage}
                tasks={user.tasks}
                specialistSlug={user.specialistProfile.slug}
              />
            )}

            {/* Лимиты (для специалистов) */}
            {user.hasSpecialistProfile && user.specialistProfile && (
              <LimitsWidget specialistId={user.specialistProfile.id} />
            )}

            {/* Услуги (для специалистов) - перенесено в основную колонку */}
            {user.hasSpecialistProfile && user.services && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💼 Мои услуги</CardTitle>
                </CardHeader>
                <CardContent>
                  <ServicesList 
                    services={user.services}
                    specialistSlug={user.hasSpecialistProfile ? user.specialistProfile?.slug : undefined}
                  />
                </CardContent>
              </Card>
            )}

            {/* Лид-магниты (для специалистов) */}
            {user.hasSpecialistProfile && user.leadMagnets && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎁 Бесплатные материалы</CardTitle>
                </CardHeader>
                <CardContent>
                  <LeadMagnetsListWrapper 
                    leadMagnets={user.leadMagnets}
                    specialistSlug={user.hasSpecialistProfile ? user.specialistProfile?.slug : undefined}
                  />
                </CardContent>
              </Card>
            )}

            {/* Личная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Личная информация</span>
                </CardTitle>
                <CardDescription>
                  Ваши основные данные
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Имя</label>
                    <p className="text-lg font-semibold text-gray-900">{user.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Фамилия</label>
                    <p className="text-lg font-semibold text-gray-900">{user.lastName}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>Телефон</span>
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{user.phone}</p>
                </div>
                
                {user.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </label>
                    <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Баланс баллов */}
            <BalanceWidgetWrapper />

            {/* Быстрые действия */}
            {user.hasSpecialistProfile && user.specialistProfile ? (
              <QuickActions 
                slug={user.specialistProfile.slug}
                newRequestsCount={user.newRequestsCount || 0}
                newOrdersCount={user.newOrdersCount || 0}
                isSpecialist={true}
                purchasesStats={user.purchasesStats}
              />
            ) : (
            <QuickActions 
                slug={undefined}
              newRequestsCount={user.newRequestsCount || 0}
              newOrdersCount={user.newOrdersCount || 0}
                isSpecialist={false}
              purchasesStats={user.purchasesStats}
            />
            )}

            {/* Кнопка выхода */}
            <Card>
              <CardContent className="pt-6">
                <LogoutButton />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </ProfileSectionWrapper>
    </div>
  )
}
