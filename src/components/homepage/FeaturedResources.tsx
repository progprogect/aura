/**
 * Секция популярных ресурсов на главной
 * Адаптивный дизайн с сеткой на десктопе и горизонтальным скроллом на мобильных
 */

'use client'

import { useHomepageResources } from '@/hooks/useHomepageResources'
import { ResourceCard } from '@/components/resources/ResourceCard'
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

export function FeaturedResources() {
  const { resources, loading, error } = useHomepageResources()

  // Скрываем секцию если ошибка или нет ресурсов
  if (error || (!loading && resources.length === 0)) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="py-16 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            📚 Популярные ресурсы
          </h2>
          <p className="text-muted-foreground">
            Полезные материалы от верифицированных специалистов
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <>
            {/* Десктоп/планшет */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>

            {/* Мобильный */}
            <div className="md:hidden -mx-4 sm:-mx-6">
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 mb-8 snap-x snap-mandatory scrollbar-hide px-4 sm:px-6">
                {Array.from({ length: 6 }).map((_, i) => (
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
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {resources.map((resource, index) => (
                <ResourceCard key={resource.id} resource={resource} index={index} />
              ))}
            </div>

            {/* Мобильный: Адаптивный горизонтальный скролл */}
            <div className="md:hidden -mx-4 sm:-mx-6">
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 mb-12 snap-x snap-mandatory scrollbar-hide px-4 sm:px-6">
                {resources.map((resource, index) => (
                  <div key={resource.id} className="w-[calc(100vw-2rem)] min-w-[260px] max-w-[300px] sm:min-w-[280px] snap-start flex-shrink-0">
                    <ResourceCard resource={resource} index={index} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Кнопка "Смотреть все ресурсы" */}
        <div className="flex justify-center">
          <Link
            href="/library"
            prefetch={true}
            className="group inline-flex items-center gap-2 px-8 py-4 text-base md:text-lg font-semibold text-white bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Смотреть все ресурсы
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

