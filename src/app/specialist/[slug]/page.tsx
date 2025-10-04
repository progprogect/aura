import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { incrementProfileView } from '@/lib/redis'
import { categoryConfigService } from '@/lib/category-config'
import { SpecialistHero } from '@/components/specialist/SpecialistHero'
import { SpecialistProfile } from '@/components/specialist/SpecialistProfile'
import type { Tab } from '@/components/specialist/SpecialistTabs'

interface PageProps {
  params: {
    slug: string
  }
}

// Получение данных специалиста
async function getSpecialist(slug: string) {
  const specialist = await prisma.specialist.findUnique({
    where: { slug },
    include: {
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
    },
  })

  return specialist
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
    notFound()
  }

  // Инкремент просмотров (не блокирующий)
  incrementProfileView(specialist.id).catch(console.error)

  const fullName = `${specialist.firstName} ${specialist.lastName}`

  // Получаем конфигурацию категории через сервис
  const categoryConfig = await categoryConfigService.getCategoryConfigSafe(
    specialist.category
  )

  // Определяем табы в зависимости от наличия контента
  const tabs: Tab[] = [
    { id: 'about', label: 'О себе', icon: '💼' },
    specialist.education.length > 0 || specialist.certificates.length > 0
      ? { id: 'education', label: 'Образование', icon: '🎓' }
      : null,
    specialist.gallery.length > 0 ? { id: 'gallery', label: 'Галерея', icon: '🖼' } : null,
    specialist.faqs.length > 0 ? { id: 'faq', label: 'Вопросы', icon: '❓' } : null,
    { id: 'contact', label: 'Связаться', icon: '✉️' },
  ].filter(Boolean) as Tab[]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <SpecialistHero
        firstName={specialist.firstName}
        lastName={specialist.lastName}
        avatar={specialist.avatar}
        category={specialist.category}
        categoryEmoji={categoryConfig?.emoji}
        specializations={specialist.specializations}
        tagline={specialist.tagline}
        city={specialist.city}
        country={specialist.country}
        workFormats={specialist.workFormats}
        yearsOfPractice={specialist.yearsOfPractice}
        verified={specialist.verified}
        profileViews={specialist.profileViews}
        onContactClick={() => {
          // Скролл к форме
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
        }}
        onShowContactsClick={() => {
          // TODO: Показать модалку с контактами + аналитика
          alert('Показать контакты')
        }}
      />

      {/* Профиль с табами и контентом */}
      <SpecialistProfile
        tabs={tabs}
        categoryConfig={categoryConfig}
        data={{
          id: specialist.id,
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
        }}
      />
    </div>
  )
}

