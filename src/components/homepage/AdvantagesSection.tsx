/**
 * Секция преимуществ Эколюции 360
 * Красивое оформление без банальных цифр
 */

'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icons/Icon'
import { ShieldCheck, LayoutGrid, Award, Users } from 'lucide-react'

const advantages = [
  {
    icon: LayoutGrid,
    title: 'Экосистема роста',
    description: 'Материалы, специалисты и услуги в одном окне. Не нужно искать информацию в разных источниках.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Award,
    title: 'Эксперты топ-уровня',
    description: 'Строгий отбор: проверяем дипломы и опыт каждого специалиста. Только подтвержденная квалификация.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: ShieldCheck,
    title: 'Прозрачность и доверие',
    description: 'Честные отзывы, безопасная оплата и поддержка. Мы гарантируем качество на каждом этапе.',
    color: 'from-green-500 to-green-600'
  }
]

export function AdvantagesSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
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
              Почему выбирают Эволюцию&nbsp;360
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Мы создали среду, где каждый шаг к цели становится проще, безопаснее и эффективнее
            </p>
          </motion.div>

          {/* Карточки преимуществ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {/* Иконка с градиентом */}
                      <div className={`w-16 h-16 bg-gradient-to-br ${advantage.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <Icon 
                          icon={advantage.icon} 
                          size={32} 
                          className="text-white" 
                        />
                      </div>

                      {/* Контент */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">
                          {advantage.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {advantage.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
            <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-gray-50 border border-gray-100 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span>Более 500 проверенных специалистов уже с нами</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
