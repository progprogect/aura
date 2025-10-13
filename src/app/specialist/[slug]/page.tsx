import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
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

interface PageProps {
  params: {
    slug: string
  }
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

  // Преобразуем в формат, совместимый с существующими компонентами
  return {
    id: specialistProfile.id,
    firstName: specialistProfile.user.firstName,
    lastName: specialistProfile.user.lastName,
    email: specialistProfile.user.email,
    avatar: specialistProfile.user.avatar,
    slug: specialistProfile.slug,
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
    instagram: specialistProfile.instagram,
    website: specialistProfile.website,
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
    createdAt: specialistProfile.createdAt,
    updatedAt: specialistProfile.updatedAt,
    education: specialistProfile.education,
    certificates: specialistProfile.certificates,
    gallery: specialistProfile.gallery,
    faqs: specialistProfile.faqs,
    leadMagnets: specialistProfile.leadMagnets.map(lm => fromPrismaLeadMagnet(lm)),
    services: specialistProfile.services,
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
      title: 'Специалист не найден | Аура',
    }
  }

  const fullName = `${specialist.firstName} ${specialist.lastName}`
  const title = specialist.metaTitle || `${fullName} — ${specialist.specializations[0]} | Аура`
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

export default async function SpecialistPage({ params }: PageProps) {
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

  // Инкремент просмотров (не блокирующий, но не для владельца)
  if (!isOwner) {
    incrementProfileView(specialist.id).catch((error) => {
      console.error('Failed to increment profile view:', error)
    })
  }

  const fullName = `${specialist.firstName} ${specialist.lastName}`

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
    specialist.priceFrom || specialist.priceTo ? { id: 'pricing', label: 'Стоимость', icon: 'currency-dollar' } : null,
    specialist.services.length > 0 ? { id: 'services', label: 'Услуги', icon: 'shopping-cart' } : null,
    specialist.leadMagnets.length > 0 ? { id: 'lead-magnets', label: 'Материалы', icon: 'gift' } : null,
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
          country: specialist.country,
          workFormats: specialist.workFormats,
          yearsOfPractice: specialist.yearsOfPractice,
          verified: specialist.verified,
          acceptingClients: specialist.acceptingClients,
          profileViews: specialist.profileViews,
          specializations: specialist.specializations,
        }}
        contactsData={{
          email: specialist.email,
          telegram: specialist.telegram,
          whatsapp: specialist.whatsapp,
          instagram: specialist.instagram,
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
        }}
      />
    </div>
  )
}

