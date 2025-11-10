/**
 * Базовый компонент услуг без заголовка
 * Используется внутри Section для композиции
 */

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatServicePrice } from '@/lib/services/utils'
import type { Service } from '@/types/service'

export interface SpecialistServicesContentProps {
  services: Service[]
  specialistSlug: string
}

export function SpecialistServicesContent({ services, specialistSlug }: SpecialistServicesContentProps) {
  if (services.length === 0) {
    return null
  }

  return (
    <motion.section
      id="services"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Сетка карточек */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={`/specialist/${specialistSlug}/services/${service.slug}`}
              className="block group"
            >
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6 h-full hover:border-blue-400 hover:shadow-lg transition-all duration-200">
                {/* Emoji & Title */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{service.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    {service.deliveryDays !== null && service.deliveryDays !== undefined && service.deliveryDays > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        ⏱️ {service.deliveryDays} {service.deliveryDays === 1 ? 'день' : 'дней'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {service.description}
                </p>

                {/* Highlights preview */}
                {service.highlights.length > 0 && (
                  <div className="mb-4 space-y-1">
                    {service.highlights.slice(0, 2).map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-600 mt-0.5 shrink-0">✓</span>
                        <span className="line-clamp-1">{highlight}</span>
                      </div>
                    ))}
                    {service.highlights.length > 2 && (
                      <p className="text-xs text-gray-500 pl-5">
                        и ещё {service.highlights.length - 2}
                      </p>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="mt-auto pt-4 border-t">
                  <p className="text-2xl font-bold text-green-700">
                    {formatServicePrice(service.price, service.currency)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    за услугу
                  </p>
                </div>

                {/* CTA */}
                <div className="mt-4">
                  <div className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg text-center group-hover:bg-blue-700 transition-colors">
                    Подробнее →
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

