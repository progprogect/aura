/**
 * Детальная страница лид-магнита (mobile-first, минималистичная)
 */

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { cache } from 'react'
import { prisma } from '@/lib/db'
import { Breadcrumbs } from '@/components/lead-magnet/Breadcrumbs'
import { PreviewBlock } from '@/components/lead-magnet/PreviewBlock'
import { HighlightsList } from '@/components/lead-magnet/HighlightsList'
import { MetadataRow } from '@/components/lead-magnet/MetadataRow'
import { CTAButton } from '@/components/lead-magnet/CTAButton'
import { shouldShowPreview, generateOGTags } from '@/lib/lead-magnets/utils'
import { fromPrismaLeadMagnet } from '@/types/lead-magnet'

interface PageProps {
  params: {
    slug: string
    leadMagnetSlug: string
  }
}

// Кешируем запрос к БД для избежания дублирования в generateMetadata и page
const getLeadMagnetData = cache(async (slug: string, leadMagnetSlug: string) => {
  const specialist = await prisma.specialistProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
        }
      }
    }
  })

  if (!specialist) return null

  const leadMagnet = await prisma.leadMagnet.findFirst({
    where: {
      specialistProfileId: specialist.id,
      slug: leadMagnetSlug,
      isActive: true,
    }
  })

  if (!leadMagnet) return null

  // Трекаем просмотр (с обработкой ошибок - не должно ломать страницу)
  try {
    await prisma.leadMagnet.update({
      where: { id: leadMagnet.id },
      data: { viewCount: { increment: 1 } }
    })
  } catch (error) {
    // Логируем ошибку, но не ломаем страницу
    console.error('[LeadMagnet] Ошибка трекинга просмотра:', error)
  }

  return {
    specialist: {
      id: specialist.id,
      slug: specialist.slug,
      firstName: specialist.user.firstName,
      lastName: specialist.user.lastName,
      avatar: specialist.user.avatar,
    },
    leadMagnet: fromPrismaLeadMagnet(leadMagnet) // Конвертируем Prisma объект в типизированный
  }
})

// Генерация метаданных для SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getLeadMagnetData(params.slug, params.leadMagnetSlug)

  if (!data) {
    return {
      title: 'Лид-магнит не найден',
    }
  }

  const { specialist, leadMagnet } = data
  const ogTags = generateOGTags(leadMagnet, specialist)

  return {
    title: ogTags.title,
    description: ogTags.description,
    openGraph: {
      title: ogTags.title,
      description: ogTags.description,
      images: [ogTags.image],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTags.title,
      description: ogTags.description,
      images: [ogTags.image],
    },
  }
}

export default async function LeadMagnetPage({ params }: PageProps) {
  const data = await getLeadMagnetData(params.slug, params.leadMagnetSlug)

  if (!data) {
    notFound()
  }

  const { specialist, leadMagnet } = data
  const specialistName = `${specialist.firstName} ${specialist.lastName}`
  const showPreview = shouldShowPreview(leadMagnet)

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-6">
      {/* Breadcrumbs (sticky) */}
      <Breadcrumbs
        specialistSlug={specialist.slug}
        specialistName={specialistName}
        leadMagnetTitle={leadMagnet.title}
      />

      {/* Content (max-w-2xl, centered, padding) */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Preview (conditional) */}
        {showPreview && <PreviewBlock leadMagnet={leadMagnet} />}

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-start gap-2">
            <span className="text-3xl md:text-4xl">{leadMagnet.emoji}</span>
            <span className="flex-1">{leadMagnet.title}</span>
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            {leadMagnet.description}
          </p>
        </div>

        {/* Highlights (if exists) */}
        <HighlightsList items={leadMagnet.highlights || []} />

        {/* Metadata row */}
        <MetadataRow
          targetAudience={leadMagnet.targetAudience}
          downloadCount={leadMagnet.downloadCount}
          fileSize={leadMagnet.fileSize}
          type={leadMagnet.type}
        />
      </main>

      {/* CTA (sticky on mobile, regular on desktop) */}
      <CTAButton
        leadMagnet={leadMagnet}
        specialistId={specialist.id}
        specialistName={specialistName}
      />
    </div>
  )
}

