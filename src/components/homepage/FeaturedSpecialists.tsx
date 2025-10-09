/**
 * Секция популярных специалистов на главной
 * Воздушный дизайн с сеткой на десктопе и горизонтальным скроллом на мобильных
 */

'use client'

import { useHomepageSpecialists } from '@/hooks/useHomepageSpecialists'
import { SpecialistCard } from '@/components/catalog/SpecialistCard'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Icon } from '@/components/ui/icons/Icon'
import { ArrowRight } from '@/components/ui/icons/catalog-icons'

// Простой skeleton для загрузки
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-12 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

export function FeaturedSpecialists() {
  const { specialists, loading, error } = useHomepageSpecialists()

  // Скрываем секцию если ошибка или нет специалистов
  if (error || (!loading && specialists.length === 0)) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="py-16"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            ✨ Популярные специалисты
          </h2>
          <p className="text-muted-foreground">
            Проверенные эксперты с высоким рейтингом
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <>
            {/* Десктоп/планшет */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>

            {/* Мобильный */}
            <div className="md:hidden -mx-4 sm:-mx-6">
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 mb-8 snap-x snap-mandatory scrollbar-hide px-4 sm:px-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-[calc(100vw-2rem)] min-w-[260px] max-w-[300px] sm:min-w-[280px] snap-start flex-shrink-0">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Десктоп и планшет: Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {specialists.map((specialist) => (
                <SpecialistCard key={specialist.id} specialist={specialist} />
              ))}
            </div>

            {/* Мобильный: Адаптивный горизонтальный скролл */}
            <div className="md:hidden -mx-4 sm:-mx-6">
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 mb-12 snap-x snap-mandatory scrollbar-hide px-4 sm:px-6">
                {specialists.map((specialist) => (
                  <div key={specialist.id} className="w-[calc(100vw-2rem)] min-w-[260px] max-w-[300px] sm:min-w-[280px] snap-start flex-shrink-0">
                    <SpecialistCard specialist={specialist} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Кнопка "Смотреть всех" */}
        <div className="flex justify-center">
          <Link
            href="/catalog"
            prefetch={true}
            className="group inline-flex items-center gap-2 px-8 py-4 text-base md:text-lg font-semibold text-white bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Смотреть всех специалистов
            <Icon
              icon={ArrowRight}
              size={20}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </Link>
        </div>
      </div>
    </motion.section>
  )
}

