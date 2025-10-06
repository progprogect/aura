/**
 * Финальная CTA секция
 * Четкий призыв к действию
 */

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons/Icon'
import { ArrowRight, MessageCircle } from '@/components/ui/icons/catalog-icons'

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            {/* Заголовок */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Готовы найти специалиста?
              </h2>
              <p className="text-lg text-muted-foreground">
                Первая консультация уже сегодня
              </p>
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="text-lg px-8 py-6 h-auto">
                <Link href="/catalog">
                  Найти специалиста
                  <Icon icon={ArrowRight} size={20} />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
                <Icon icon={MessageCircle} size={20} />
                Попробовать AI
              </Button>
            </div>

            {/* Дополнительная информация */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-muted-foreground">
                Без регистрации • Прямая связь со специалистом • Первая консультация в течение дня
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
