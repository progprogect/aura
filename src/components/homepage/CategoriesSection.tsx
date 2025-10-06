/**
 * Секция популярных категорий специалистов
 * Минималистичный дизайн с иконками
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
    key: 'psychology',
    href: '/catalog?category=psychology'
  },
  { 
    name: 'Фитнес', 
    key: 'fitness',
    href: '/catalog?category=fitness'
  },
  { 
    name: 'Питание', 
    key: 'nutrition',
    href: '/catalog?category=nutrition'
  },
  { 
    name: 'Массаж', 
    key: 'massage',
    href: '/catalog?category=massage'
  },
  { 
    name: 'Коучинг', 
    key: 'coaching',
    href: '/catalog?category=coaching'
  },
  { 
    name: 'Медицина', 
    key: 'medicine',
    href: '/catalog?category=medicine'
  }
]

export function CategoriesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Популярные специализации
            </h2>
            <p className="text-lg text-muted-foreground">
              Выберите категорию или найдите через AI-помощника
            </p>
          </motion.div>

          {/* Сетка категорий */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Link
                  href={category.href}
                  className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center group"
                  aria-label={`Перейти к категории ${category.name}`}
                >
                  {/* Иконка */}
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <CategoryIcon 
                      category={category.key} 
                      size={24} 
                      className="text-primary" 
                    />
                  </div>
                  
                  {/* Название */}
                  <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
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
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Все категории
              <Icon icon={ArrowRight} size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
