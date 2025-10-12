/**
 * Страница детали услуги специалиста
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cache } from 'react'
import { prisma } from '@/lib/db'
import { OrderForm } from '@/components/services/OrderForm'
import { formatServicePrice } from '@/lib/services/utils'

interface PageProps {
  params: {
    slug: string
    serviceSlug: string
  }
}

// Кешируем запрос
const getServiceData = cache(async (slug: string, serviceSlug: string) => {
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

  const service = await prisma.service.findFirst({
    where: {
      specialistProfileId: specialist.id,
      slug: serviceSlug,
      isActive: true,
    }
  })

  if (!service) return null

  // Трекаем просмотр
  try {
    await prisma.service.update({
      where: { id: service.id },
      data: { viewCount: { increment: 1 } }
    })
  } catch (error) {
    console.error('[Service] Ошибка трекинга просмотра:', error)
  }

  return {
    specialist: {
      id: specialist.id,
      slug: specialist.slug,
      firstName: specialist.user.firstName,
      lastName: specialist.user.lastName,
      avatar: specialist.user.avatar,
      category: specialist.category,
    },
    service
  }
})

// Метаданные для SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getServiceData(params.slug, params.serviceSlug)
  
  if (!data) {
    return {
      title: 'Услуга не найдена',
    }
  }

  const { specialist, service } = data
  const fullName = `${specialist.firstName} ${specialist.lastName}`

  return {
    title: `${service.title} — ${fullName} | Аура`,
    description: service.description.substring(0, 160),
  }
}

export default async function ServicePage({ params }: PageProps) {
  const data = await getServiceData(params.slug, params.serviceSlug)

  if (!data) {
    notFound()
  }

  const { specialist, service } = data
  const fullName = `${specialist.firstName} ${specialist.lastName}`

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href={`/specialist/${specialist.slug}`} className="hover:text-blue-600">
            {fullName}
          </Link>
          <span className="mx-2">→</span>
          <Link href={`/specialist/${specialist.slug}#services`} className="hover:text-blue-600">
            Услуги
          </Link>
          <span className="mx-2">→</span>
          <span className="text-gray-900">{service.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основной контент */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero */}
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <span className="text-5xl">{service.emoji}</span>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {service.title}
                  </h1>
                  {service.deliveryDays && (
                    <p className="text-gray-600">
                      ⏱️ Срок выполнения: {service.deliveryDays} {service.deliveryDays === 1 ? 'день' : 'дней'}
                    </p>
                  )}
                </div>
              </div>

              {/* Цена */}
              <div className="mb-6 p-6 bg-green-50 rounded-lg border-2 border-green-200">
                <p className="text-sm text-green-700 font-medium mb-1">Стоимость</p>
                <p className="text-4xl font-bold text-green-700">
                  {formatServicePrice(service.price, service.currency)}
                </p>
              </div>

              {/* Что входит */}
              {service.highlights.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    ✨ Что входит
                  </h2>
                  <div className="space-y-3">
                    {service.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-green-600 text-xl mt-0.5 shrink-0">✓</span>
                        <p className="text-gray-800">{highlight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Описание */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📝 Описание
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Форма заказа */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Карточка специалиста */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  {specialist.avatar && (
                    <img
                      src={specialist.avatar}
                      alt={fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{fullName}</h3>
                    <p className="text-sm text-gray-600">{specialist.category}</p>
                  </div>
                </div>
                <Link
                  href={`/specialist/${specialist.slug}`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Смотреть профиль →
                </Link>
              </div>

              {/* Форма заказа */}
              <OrderForm
                serviceId={service.id}
                serviceName={service.title}
                specialistName={fullName}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

