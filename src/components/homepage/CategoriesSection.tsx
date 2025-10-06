/**
 * Секция популярных категорий специалистов
 * Крупные карточки с градиентами и счетчиками
 */

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Icon } from '@/components/ui/icons/Icon'
import { CategoryIcon } from '@/components/ui/icons/CategoryIcon'
import { ArrowRight } from 'lucide-react'

const categories = [
  { 
    name: 'Психология', 
    description: 'Ментальное здоровье и терапия',
    key: 'psychology',
    href: '/catalog?category=psychology',
    gradient: 'from-purple-500 to-pink-500',
    count: '45+'
  },
  { 
    name: 'Фитнес', 
    description: 'Физическая активность и тренировки',
    key: 'fitness',
    href: '/catalog?category=fitness',
    gradient: 'from-orange-500 to-red-500',
    count: '32+'
  },
  { 
    name: 'Питание', 
    description: 'Здоровое питание и нутрициология',
    key: 'nutrition',
    href: '/catalog?category=nutrition',
    gradient: 'from-green-500 to-emerald-500',
    count: '28+'
  },
  { 
    name: 'Массаж', 
    description: 'Релаксация и восстановление',
    key: 'massage',
    href: '/catalog?category=massage',
    gradient: 'from-blue-500 to-cyan-500',
    count: '18+'
  },
  { 
    name: 'Коучинг', 
    description: 'Личностное развитие и карьера',
    key: 'coaching',
    href: '/catalog?category=coaching',
    gradient: 'from-yellow-500 to-orange-500',
    count: '22+'
  },
  { 
    name: 'Медицина', 
    description: 'Медицинские консультации',
    key: 'medicine',
    href: '/catalog?category=medicine',
    gradient: 'from-red-500 to-pink-500',
    count: '15+'
  }
]

export function CategoriesSection() {
  return (
    <section className="py-20 bg-muted/30">
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
              Все сферы вашего здоровья
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Найдите специалиста для любой области саморазвития
            </p>
          </motion.div>

          {/* Сетка категорий - 3 колонки на десктопе */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category, index) => (
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
                    {/* Иконка с градиентом */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <CategoryIcon 
                        category={category.key} 
                        size={32} 
                        className="text-white" 
                      />
                    </div>
                    
                    {/* Контент */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {category.description}
                      </p>
                      
                      {/* Счетчик специалистов */}
                      <div className="flex items-center gap-2 pt-2">
                        <div className="flex -space-x-2">
                          {/* Мини-аватары (декоративные) */}
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white" />
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 border-2 border-white" />
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 border-2 border-white" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {category.count} специалистов
                        </span>
                      </div>
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
