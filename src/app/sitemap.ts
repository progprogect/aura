import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://aura.ru'
  
  try {
    // Получаем всех специалистов для генерации URL
    const specialists = await prisma.specialist.findMany({
      where: { acceptingClients: true },
      select: { slug: true, updatedAt: true },
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
    const specialistPages = specialists.map((specialist) => ({
      url: `${baseUrl}/specialist/${specialist.slug}`,
      lastModified: specialist.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...specialistPages]
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
