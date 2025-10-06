/**
 * Hero секция главной страницы
 * Воздушный дизайн с популярными специалистами
 */

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Icon } from '@/components/ui/icons/Icon'
import { ArrowRight } from '@/components/ui/icons/catalog-icons'
import { HeroNavigation } from './HeroNavigation'
import { FeaturedSpecialists } from './FeaturedSpecialists'

export function HeroSection() {

  return (
    <section className="relative overflow-hidden">
      {/* Интегрированная навигация */}
      <HeroNavigation />
      
      {/* Фоновый градиент */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
      
      <div className="relative pt-20 pb-8">
        {/* Заголовок */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 mb-8"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Ваш путь к{' '}
              <span className="bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                здоровому образу жизни
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Найдите проверенных специалистов для поддержания здоровья и саморазвития
            </p>
          </motion.div>

          {/* Дополнительная информация */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center text-sm text-muted-foreground mb-12"
          >
            <p>Персональный подбор • Без регистрации • Прямая связь со специалистом</p>
          </motion.div>
        </div>

        {/* Секция популярных специалистов */}
        <FeaturedSpecialists />
      </div>
    </section>
  )
}
