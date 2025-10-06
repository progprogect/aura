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

          {/* Шаги */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center relative"
              >
                {/* Стрелка между шагами (только на десктопе) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-12 h-0.5 bg-primary/30 transform translate-x-6">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-primary/30 border-t-2 border-t-transparent border-b-2 border-b-transparent" />
                  </div>
                )}

                {/* Иконка */}
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Icon icon={step.icon} size={32} className="text-white" />
                </div>

                {/* Контент */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Номер шага */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
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
