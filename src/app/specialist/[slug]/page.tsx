import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Suspense } from 'react'
// Убираем импорт иконок - теперь используем строковые идентификаторы
import { prisma } from '@/lib/db'
import { incrementProfileView } from '@/lib/redis'
import { categoryConfigService } from '@/lib/category-config'
import { getCurrentSpecialist } from '@/lib/auth/server'
import { SpecialistHero } from '@/components/specialist/SpecialistHero'
import { SpecialistProfileWithEdit } from '@/components/specialist/SpecialistProfileWithEdit'
import { SpecialistNavigation } from '@/components/navigation/SpecialistNavigation'
import type { Tab } from '@/components/specialist/SpecialistTabs'
import { fromPrismaLeadMagnet } from '@/types/lead-magnet'
import { getReviewDistribution } from '@/lib/reviews/stats-service'
import { detectTrafficSource } from '@/lib/analytics/source-detection'

interface PageProps {
  params: {
    slug: string
  }
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

// Получение данных специалиста (Unified)
async function getSpecialist(slug: string) {
  console.log('[Specialist Page] 🔍 Поиск профиля по slug:', slug)
  
  const specialistProfile = await prisma.specialistProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          phone: true, // Добавляем phone для отображения в контактах
        }
      },
      education: {
        orderBy: { order: 'asc' },
      },
      certificates: {
        orderBy: { order: 'asc' },
      },
      gallery: {
        orderBy: { order: 'asc' },
      },
      portfolio: {
        orderBy: { order: 'asc' },
      },
      faqs: {
        orderBy: { order: 'asc' },
      },
      leadMagnets: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
      services: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!specialistProfile) {
    console.error('[Specialist Page] ❌ Профиль не найден по slug:', slug)
    return null
  }
  
  console.log('[Specialist Page] ✅ Профиль найден:', specialistProfile.id)

  // Получаем отзывы и статистику параллельно для оптимизации
  const [initialReviews, totalReviewsCount, reviewDistribution] = await Promise.all([
    prisma.review.findMany({
      where: { specialistId: specialistProfile.id },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        order: {
          include: {
            service: {
              select: {
                title: true,
                emoji: true
              }
            }
          }
        }
      }
    }),
    prisma.review.count({
      where: { specialistId: specialistProfile.id }
    }),
    getReviewDistribution(specialistProfile.id)
  ])

  // Преобразуем в формат, совместимый с существующими компонентами
  return {
    id: specialistProfile.id,
    firstName: specialistProfile.user.firstName,
    lastName: specialistProfile.user.lastName,
    email: specialistProfile.user.email,
    avatar: specialistProfile.user.avatar,
    phone: specialistProfile.user.phone, // Добавляем phone для контактов
    slug: specialistProfile.slug,
    profileType: (specialistProfile.profileType || 'specialist') as 'specialist' | 'company',
    companyName: specialistProfile.companyName,
    address: specialistProfile.address,
    addressCoordinates: (() => {
      const coords = specialistProfile.addressCoordinates
      if (!coords || typeof coords !== 'object' || Array.isArray(coords)) return null
      if ('lat' in coords && 'lng' in coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
        return { lat: coords.lat, lng: coords.lng }
      }
      return null
    })(),
    taxId: specialistProfile.taxId,
    category: specialistProfile.category,
    specializations: specialistProfile.specializations,
    tagline: specialistProfile.tagline,
    about: specialistProfile.about,
    city: specialistProfile.city,
    country: specialistProfile.country,
    workFormats: specialistProfile.workFormats,
    yearsOfPractice: specialistProfile.yearsOfPractice,
    telegram: specialistProfile.telegram,
    whatsapp: specialistProfile.whatsapp,
    website: specialistProfile.website,
    phoneVisible: specialistProfile.phoneVisible ?? true, // По умолчанию true для обратной совместимости
    priceFrom: specialistProfile.priceFrom,
    priceTo: specialistProfile.priceTo,
    currency: specialistProfile.currency,
    priceDescription: specialistProfile.priceDescription,
    customFields: specialistProfile.customFields,
    videoUrl: specialistProfile.videoUrl,
    verified: specialistProfile.verified,
    verifiedAt: specialistProfile.verifiedAt,
    acceptingClients: specialistProfile.acceptingClients,
    metaTitle: specialistProfile.metaTitle,
    metaDescription: specialistProfile.metaDescription,
    subscriptionTier: specialistProfile.subscriptionTier,
    profileViews: specialistProfile.profileViews,
    contactViews: specialistProfile.contactViews,
    averageRating: specialistProfile.averageRating,
    totalReviews: specialistProfile.totalReviews,
    createdAt: specialistProfile.createdAt,
    updatedAt: specialistProfile.updatedAt,
    education: specialistProfile.education,
    certificates: specialistProfile.certificates,
    gallery: specialistProfile.gallery,
    portfolio: specialistProfile.portfolio,
    faqs: specialistProfile.faqs,
    leadMagnets: specialistProfile.leadMagnets.map(lm => fromPrismaLeadMagnet(lm)),
    services: specialistProfile.services,
    initialReviews: {
      success: true,
      reviews: initialReviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          firstName: review.user.firstName,
          lastName: review.user.lastName,
          avatar: review.user.avatar
        },
        order: {
          service: {
            title: review.order.service.title,
            emoji: review.order.service.emoji
          }
        }
      })),
      pagination: {
        page: 1,
        limit: 3,
        total: totalReviewsCount,
        pages: Math.ceil(totalReviewsCount / 3)
      },
      stats: {
        averageRating: specialistProfile.averageRating,
        totalReviews: specialistProfile.totalReviews,
        distribution: reviewDistribution
      }
    }
  }
}

// ISR: страницы генерируются по требованию и кешируются на 60 секунд
// БД не нужна во время build - страницы создаются при первом визите
export const revalidate = 60

// SSG отключен - используем ISR для совместимости с Railway
// export async function generateStaticParams() {
//   const specialists = await prisma.specialist.findMany({
//     where: { verified: true },
//     select: { slug: true },
//   })
//
//   return specialists.map(specialist => ({
//     slug: specialist.slug,
//   }))
// }

// SEO: генерация metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const specialist = await getSpecialist(params.slug)

  if (!specialist) {
    return {
      title: 'Специалист не найден | Эволюция 360',
    }
  }

  const isCompany = specialist.profileType === 'company'
  const fullName = isCompany && specialist.companyName 
    ? specialist.companyName 
    : `${specialist.firstName} ${specialist.lastName}`
  const title = specialist.metaTitle || `${fullName} — ${specialist.specializations[0]} | Эволюция 360`
  const description =
    specialist.metaDescription ||
    specialist.tagline ||
    `${fullName}. ${specialist.specializations.join(', ')}. ${specialist.city || 'Онлайн консультации'}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: specialist.avatar ? [specialist.avatar] : [],
      type: 'profile',
    },
    // JSON-LD для Google Rich Snippets
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: fullName,
        jobTitle: specialist.specializations[0],
        description: specialist.about,
        image: specialist.avatar,
        address: specialist.city
          ? {
              '@type': 'PostalAddress',
              addressLocality: specialist.city,
              addressCountry: specialist.country,
            }
          : undefined,
      }),
    },
  }
}

export default async function SpecialistPage({ params, searchParams }: PageProps) {
  const specialist = await getSpecialist(params.slug)

  if (!specialist) {
    console.error('[Specialist Page] ❌ Профиль не найден, проверяем владельца...')
    
    // 🔄 FALLBACK: Проверяем, может быть это владелец профиля с битым slug
    const currentUser = await getCurrentSpecialist()
    
    if (currentUser) {
      console.log('[Specialist Page] Текущий пользователь - специалист:', currentUser.id)
      console.log('[Specialist Page] Его slug:', currentUser.slug)
      
      // Если slug текущего пользователя совпадает с запрашиваемым - редирект на правильный
      if (currentUser.slug && currentUser.slug !== params.slug) {
        console.log('[Specialist Page] 🔄 Редирект на правильный slug:', currentUser.slug)
        // Не редиректим, показываем 404 - пусть slug в профиле исправится
      }
    }
    
    notFound()
  }

  // Проверяем, является ли текущий пользователь владельцем профиля
  const currentUser = await getCurrentSpecialist()
  const isOwner = currentUser?.id === specialist.id
  
  console.log('[Specialist Page] isOwner:', isOwner, '| currentUser.id:', currentUser?.id, '| specialist.id:', specialist.id)

  // Определяем источник трафика
  const headersList = await headers()
  const referer = headersList.get('referer')
  const resolvedSearchParams = await searchParams
  const source = detectTrafficSource(resolvedSearchParams || {}, referer)

  // Инкремент просмотров (не блокирующий, но не для владельца)
  if (!isOwner) {
    incrementProfileView(specialist.id, source).catch((error) => {
      console.error('Failed to increment profile view:', error)
    })
  }

  const isCompany = specialist.profileType === 'company'
  const fullName = isCompany && specialist.companyName 
    ? specialist.companyName 
    : `${specialist.firstName} ${specialist.lastName}`

  // Получаем конфигурацию категории через сервис
  const categoryConfig = await categoryConfigService.getCategoryConfigSafe(
    specialist.category
  )

  // Определяем табы в зависимости от наличия контента (порядок соответствует структуре профиля)
  const tabs: Tab[] = [
    { id: 'about', label: 'О себе', icon: 'user' },
    specialist.customFields && categoryConfig ? { id: 'specialization', label: 'Специализация', icon: 'sparkles' } : null,
    specialist.videoUrl ? { id: 'video', label: 'Видео', icon: 'video-camera' } : null,
    specialist.gallery.length > 0 ? { id: 'gallery', label: 'Галерея', icon: 'photo' } : null,
    specialist.education.length > 0 || specialist.certificates.length > 0
      ? { id: 'education', label: 'Образование', icon: 'academic-cap' }
      : null,
    // Убираем таб "Стоимость" - цены теперь только в услугах
    // specialist.priceFrom || specialist.priceTo ? { id: 'pricing', label: 'Стоимость', icon: 'currency-dollar' } : null,
    specialist.services.length > 0 ? { id: 'services', label: 'Услуги', icon: 'shopping-cart' } : null,
    specialist.leadMagnets.length > 0 ? { id: 'lead-magnets', label: 'Материалы', icon: 'gift' } : null,
    specialist.totalReviews && specialist.totalReviews > 0 ? { id: 'reviews', label: 'Отзывы', icon: 'star' } : null,
    specialist.faqs.length > 0 ? { id: 'faq', label: 'Вопросы', icon: 'question-mark-circle' } : null,
    { id: 'contact', label: 'Связаться', icon: 'paper-airplane' },
  ].filter(Boolean) as Tab[]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation (breadcrumbs + FAB) - только для чужих профилей */}
      {!isOwner && (
        <SpecialistNavigation
          specialistName={fullName}
          category={specialist.category}
        />
      )}

      {/* Профиль с табами и контентом */}
      <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
        <SpecialistProfileWithEdit
          isOwner={isOwner}
          tabs={tabs}
          categoryConfig={categoryConfig}
          heroData={{
            firstName: specialist.firstName,
            lastName: specialist.lastName,
            avatar: specialist.avatar,
            category: specialist.category,
            categoryEmoji: categoryConfig?.emoji,
            categoryName: categoryConfig?.name,
            tagline: specialist.tagline,
            city: specialist.city,
            address: specialist.address,
            country: specialist.country,
            workFormats: specialist.workFormats,
            yearsOfPractice: specialist.yearsOfPractice,
            verified: specialist.verified,
            acceptingClients: specialist.acceptingClients,
            profileViews: specialist.profileViews,
            specializations: specialist.specializations,
            averageRating: specialist.averageRating,
            totalReviews: specialist.totalReviews,
            profileType: specialist.profileType || 'specialist',
            companyName: specialist.companyName,
            addressCoordinates: specialist.addressCoordinates,
            taxId: specialist.taxId,
            website: specialist.website,
          }}
          contactsData={{
            email: specialist.email,
            phone: specialist.phone, // Телефон из User.phone
            phoneVisible: specialist.phoneVisible, // Видимость телефона для клиентов
            telegram: specialist.telegram,
            whatsapp: specialist.whatsapp,
            website: specialist.website,
          }}
          data={{
            id: specialist.id,
            slug: specialist.slug,
            fullName,
            category: specialist.category,
            about: specialist.about,
            customFields: specialist.customFields as any,
            videoUrl: specialist.videoUrl,
            gallery: specialist.gallery.map(item => ({
              id: item.id,
              type: item.type as 'photo' | 'video',
              url: item.url,
              thumbnailUrl: item.thumbnailUrl,
              caption: item.caption,
            })),
            portfolio: specialist.portfolio.map(item => ({
              id: item.id,
              type: item.type as 'photo' | 'video',
              url: item.url,
              thumbnailUrl: item.thumbnailUrl,
              title: item.title,
              description: item.description,
            })),
            education: specialist.education.map(edu => ({
              id: edu.id,
              institution: edu.institution,
              degree: edu.degree,
              year: edu.year,
              description: edu.description,
            })),
            certificates: specialist.certificates.map(cert => ({
              id: cert.id,
              title: cert.title,
              organization: cert.organization,
              year: cert.year,
              fileUrl: cert.fileUrl,
            })),
            priceFrom: specialist.priceFrom,
            priceTo: specialist.priceTo,
            currency: specialist.currency,
            priceDescription: specialist.priceDescription,
            faqs: specialist.faqs.map(faq => ({
              id: faq.id,
              question: faq.question,
              answer: faq.answer,
            })),
            leadMagnets: specialist.leadMagnets, // Уже преобразовано fromPrismaLeadMagnet() на строке 102
            services: specialist.services,
            averageRating: specialist.averageRating,
            totalReviews: specialist.totalReviews,
            initialReviews: specialist.initialReviews,
          }}
        />
      </Suspense>
    </div>
  )
}

