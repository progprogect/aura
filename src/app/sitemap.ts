import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://aura.ru'
  
  try {
    // Получаем всех специалистов для генерации URL (Unified)
    const specialistProfiles = await prisma.specialistProfile.findMany({
      where: { 
        acceptingClients: true,
        verified: true, // Всегда требуем верификацию
      },
      select: { slug: true, updatedAt: true },
    })

    // Получаем все активные лид-магниты с slug
    const leadMagnets = await prisma.leadMagnet.findMany({
      where: {
        isActive: true,
        slug: { not: null },
      },
      select: {
        slug: true,
        updatedAt: true,
        specialistProfile: {
          select: {
            slug: true,
          },
        },
      },
    })

    // Статические страницы
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/catalog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
    ]

    // Страницы специалистов
    const specialistPages = specialistProfiles.map((profile) => ({
      url: `${baseUrl}/specialist/${profile.slug}`,
      lastModified: profile.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Страницы лид-магнитов
    const leadMagnetPages = leadMagnets.map((lm) => ({
      url: `${baseUrl}/specialist/${lm.specialistProfile.slug}/resources/${lm.slug}`,
      lastModified: lm.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...specialistPages, ...leadMagnetPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Fallback sitemap если база недоступна
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/catalog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
    ]
  }
}
