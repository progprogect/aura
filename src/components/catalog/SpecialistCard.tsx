/**
 * Карточка специалиста в каталоге
 * Версия 3.0 с полным рефакторингом:
 * - Использует форматтеры из lib/formatters
 * - Использует categoryMap для категорий
 * - Lucide-react иконки
 * - Улучшенная accessibility
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { SpecialistViewModel } from '@/lib/catalog/types'
import { useCategoryMap } from '@/hooks/useCategories'
import { formatExperience } from '@/lib/formatters/experience'
import { getCategoryLabel, getCategoryEmoji, getCategoryColor } from '@/lib/formatters/category'
import { formatWorkFormat, getWorkFormatColor } from '@/lib/formatters/work-format'
import { Icon } from '@/components/ui/icons/Icon'
import { CheckCircle2, Clock, MapPin } from '@/components/ui/icons/catalog-icons'
import { saveCatalogState } from '@/lib/navigation/scroll-restoration'
import { getCatalogLabel } from '@/lib/navigation/utils'
import { RatingDisplay } from '@/components/reviews/RatingDisplay'

interface SpecialistCardProps {
  specialist: SpecialistViewModel
}

export function SpecialistCard({ specialist }: SpecialistCardProps) {
  const [imageError, setImageError] = useState(false)
  const { categoryMap } = useCategoryMap()

  // Получение данных категории
  const categoryEmoji = getCategoryEmoji(specialist.category, categoryMap)
  const categoryLabel = getCategoryLabel(specialist.category, categoryMap)
  const categoryColor = getCategoryColor(specialist.category)

  // Форматирование опыта
  const formattedExperience = formatExperience(specialist.yearsOfPractice)

  // Сохранение состояния и построение returnUrl
  const handleCardClick = () => {
    if (typeof window === 'undefined') return

    const currentRoute = window.location.pathname + window.location.search
    const scrollPosition = window.scrollY

    // Получаем label категории для FAB
    const params = new URLSearchParams(window.location.search)
    const categoryParam = params.get('category')
    const categoryLabel = getCatalogLabel(categoryParam || specialist.category)

    // Сохраняем состояние в localStorage
    saveCatalogState(currentRoute, scrollPosition, categoryLabel)
  }

  // Построение URL с returnUrl
  const profileUrl =
    typeof window !== 'undefined'
      ? `/specialist/${specialist.slug}?returnUrl=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`
      : `/specialist/${specialist.slug}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group h-full"
    >
      <Link
        href={profileUrl}
        onClick={handleCardClick}
        className="block h-full"
        aria-label={`Профиль специалиста ${specialist.fullName}`}
      >
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
          {/* Фото специалиста */}
          <div className="relative w-full aspect-square bg-gray-100 flex-shrink-0">
            {specialist.avatar && !imageError ? (
              <Image
                src={specialist.avatar}
                alt={`Фото ${specialist.fullName}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div
                className={`flex items-center justify-center h-full bg-gradient-to-br ${categoryColor}`}
              >
                <div className="text-6xl text-gray-400" aria-hidden="true">
                  {categoryEmoji}
                </div>
              </div>
            )}

            {/* Verified badge */}
            {specialist.verified && (
              <div
                className="absolute top-3 right-3"
                aria-label="Верифицирован"
              >
                <div className="bg-blue-500 rounded-full p-1.5 shadow-lg">
                  <Icon
                    icon={CheckCircle2}
                    size={16}
                    className="text-white"
                    aria-hidden
                  />
                </div>
              </div>
            )}
          </div>

          {/* Информация о специалисте */}
          <div className="p-4 flex flex-col flex-grow">
            {/* Имя */}
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors mb-1">
              {specialist.fullName}
            </h3>

            {/* Рейтинг */}
            {specialist.totalReviews > 0 && (
              <div className="mb-2">
                <RatingDisplay 
                  rating={specialist.averageRating} 
                  totalReviews={specialist.totalReviews} 
                  size="sm"
                />
              </div>
            )}

            {/* Категория компактная */}
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <span aria-hidden="true">{categoryEmoji}</span>
              <span>{categoryLabel}</span>
            </div>

            {/* Форматы работы */}
            {specialist.workFormats.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {specialist.workFormats.map((format, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2 py-0.5 rounded-full border ${getWorkFormatColor(
                      format
                    )}`}
                  >
                    {formatWorkFormat(format)}
                  </span>
                ))}
              </div>
            )}

            {/* Специализации */}
            {specialist.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3" role="list" aria-label="Специализации">
                {specialist.specializations.slice(0, 2).map((spec, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    role="listitem"
                  >
                    {spec}
                  </span>
                ))}
                {specialist.specializations.length > 2 && (
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                    aria-label={`И ещё ${specialist.specializations.length - 2} специализаций`}
                  >
                    +{specialist.specializations.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Описание с gradient fade */}
            {specialist.shortAbout && (
              <div className="relative mb-3 flex-grow">
                <p className="text-sm text-gray-600 line-clamp-4">
                  {specialist.shortAbout}
                </p>
                {/* Gradient fade если текст длинный */}
                {specialist.about.length > 200 && (
                  <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
              </div>
            )}

            {/* Дополнительная информация */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto">
              {/* Опыт */}
              {formattedExperience && (
                <span className="flex items-center gap-1" aria-label={`Опыт работы: ${formattedExperience}`}>
                  <Icon icon={Clock} size={12} aria-hidden />
                  <span>{formattedExperience}</span>
                </span>
              )}

              {/* Город */}
              {specialist.city && (
                <span className="flex items-center gap-1" aria-label={`Город: ${specialist.city}`}>
                  <Icon icon={MapPin} size={12} aria-hidden />
                  <span>{specialist.city}</span>
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}
