/**
 * Секция популярных категорий специалистов
 * Крупные карточки с градиентами и счетчиками
 */

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Icon } from '@/components/ui/icons/Icon'
import { ArrowRight } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'

// Функция для получения описания категории
function getCategoryDescription(key: string): string {
  const descriptions: Record<string, string> = {
    psychology: 'Ментальное здоровье и терапия',
    fitness: 'Физическая активность и тренировки',
    nutrition: 'Здоровое питание и нутрициология',
    massage: 'Релаксация и восстановление',
    wellness: 'Холистические практики и wellness',
    coaching: 'Личностное развитие и карьера',
    medicine: 'Медицинские консультации',
    marketing: 'Продвижение и маркетинг',
    sales: 'Продажи и переговоры',
    education: 'Обучение и образование',
    'social-media': 'Социальные сети и личный бренд',
    'business-consulting': 'Бизнес-консалтинг',
    other: 'Другие направления',
  }
  return descriptions[key] || 'Специалисты'
}

export function CategoriesSection() {
  const { categories, loading } = useCategories()

  // Формируем массив категорий для отображения (показываем первые 6-8)
  const displayCategories = categories
    .slice(0, 8)
    .map((cat) => ({
      name: cat.name,
      description: getCategoryDescription(cat.key),
      key: cat.key,
      href: `/catalog?category=${cat.key}`,
      emoji: cat.emoji,
    }))
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Заголовок */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Все категории специалистов
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Найдите специалиста для любой области развития и бизнеса
            </p>
          </motion.div>

          {/* Сетка категорий - 3 колонки на десктопе */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Загрузка категорий...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {displayCategories.map((category, index) => (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group"
              >
                <Link
                  href={category.href}
                  className="block h-full"
                  aria-label={`Перейти к категории ${category.name}`}
                >
                  <div className="h-full bg-white rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-2xl transition-all duration-300 p-8">
                    {/* Иконка с единым стилем */}
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <div className="text-3xl">{category.emoji}</div>
                    </div>
                    
                    {/* Контент */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {category.description}
                      </p>
                      
                    </div>

                    {/* Стрелка (появляется на hover) */}
                    <div className="mt-6 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium">Смотреть всех</span>
                      <Icon 
                        icon={ArrowRight} 
                        size={16} 
                        className="group-hover:translate-x-1 transition-transform" 
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
              ))}
            </div>
          )}

          {/* Кнопка "Все категории" */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Смотреть все категории
              <Icon icon={ArrowRight} size={20} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
