/**
 * Секция "Как это работает"
 * Простой и понятный процесс в 3 шага
 */

'use client'

import { motion } from 'framer-motion'
import { Icon } from '@/components/ui/icons/Icon'
import { Target, Search, TrendingUp } from 'lucide-react'

const steps = [
  {
    icon: Target,
    title: 'Определите цель',
    description: 'Решите, что вам нужно сейчас: изучить тему самостоятельно, найти наставника или заказать услугу.'
  },
  {
    icon: Search,
    title: 'Найдите решение',
    description: 'Изучите каталог специалистов, полезные материалы или просто оставьте заявку, чтобы получить предложения.'
  },
  {
    icon: TrendingUp,
    title: 'Достигайте результата',
    description: 'Начните работу с экспертом или применяйте знания из гайдов. Мы поддержим на каждом этапе развития.'
  }
]

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-gray-50">
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
              Как это работает
            </h2>
            <p className="text-lg text-muted-foreground">
              Простой путь к вашему развитию в три шага
            </p>
          </motion.div>

          {/* Прогресс-индикатор (только десктоп) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex items-center justify-center mb-12"
          >
            <div className="flex items-center space-x-4">
              {steps.map((_, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 bg-primary rounded-full shadow-sm ring-4 ring-primary/10" />
                  {index < steps.length - 1 && (
                    <div className="w-32 h-0.5 bg-gradient-to-r from-primary/20 to-primary/40 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Шаги */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center group relative"
              >
                {/* Мобильная линия (псевдоэлемент) */}
                {index < steps.length - 1 && (
                   <div className="absolute left-1/2 top-16 bottom-[-2rem] w-0.5 bg-gray-200 -translate-x-1/2 md:hidden" />
                )}

                {/* Иконка с hover-эффектом */}
                <div className="relative z-10 w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:shadow-lg group-hover:border-primary/20 group-hover:scale-110 transition-all duration-300">
                  <Icon icon={step.icon} size={32} className="text-primary" />
                </div>

                {/* Контент */}
                <div className="space-y-3 px-2">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
