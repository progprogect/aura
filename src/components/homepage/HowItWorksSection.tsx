/**
 * Секция "Как это работает"
 * Простой и понятный процесс в 3 шага
 */

'use client'

import { motion } from 'framer-motion'
import { Icon } from '@/components/ui/icons/Icon'
import { MessageCircle, Eye, Briefcase } from '@/components/ui/icons/catalog-icons'

const steps = [
  {
    icon: MessageCircle,
    title: 'Опишите проблему',
    description: 'Расскажите AI-помощнику о том, что вас беспокоит'
  },
  {
    icon: Eye,
    title: 'Выберите подходящего',
    description: 'Получите список проверенных специалистов'
  },
  {
    icon: Briefcase,
    title: 'Получите консультацию',
    description: 'Свяжитесь напрямую и начните работу'
  }
]

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-muted/30">
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
              Простой процесс поиска специалиста
            </p>
          </motion.div>

          {/* Прогресс-индикатор */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center mb-12"
          >
            <div className="flex items-center space-x-4">
              {steps.map((_, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 bg-primary rounded-full shadow-sm" />
                  {index < steps.length - 1 && (
                    <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-primary-600 mx-2" />
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
                className="text-center group"
              >
                {/* Иконка с hover-эффектом */}
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <Icon icon={step.icon} size={32} className="text-white" />
                </div>

                {/* Контент */}
                <div className="space-y-4">
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

          {/* Дополнительная информация */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-16"
          >
            <p className="text-lg text-muted-foreground">
              <span className="font-semibold text-foreground">Обычно это занимает 2-3 минуты</span>
              <br />
              От вопроса до первого контакта со специалистом
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
