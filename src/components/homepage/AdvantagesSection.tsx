/**
 * Секция преимуществ Aura
 * Красивое оформление без банальных цифр
 */

'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icons/Icon'
import { AdvantageIcon } from '@/components/ui/icons/AdvantageIcon'
import { Shield } from 'lucide-react'

const advantages = [
  {
    icon: 'target',
    title: 'Только проверенные эксперты',
    description: 'Мы отбираем топ-1% специалистов в своей области с проверенным образованием и опытом',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: 'bot',
    title: 'AI помогает найти идеального',
    description: 'За 2 минуты вместо часов поиска и сомнений. Умный алгоритм подберет именно того, кто нужен',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: 'zap',
    title: 'Никаких посредников',
    description: 'Прямая связь со специалистом без комиссий и лишних звонков. Нашли — связались — работаете',
    color: 'from-green-500 to-green-600'
  }
]

export function AdvantagesSection() {
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
              Почему Aura
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Мы не просто каталог специалистов — мы помогаем найти именно того, кто решит вашу задачу
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
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {/* Иконка с градиентом */}
                      <div className={`w-16 h-16 bg-gradient-to-br ${advantage.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <AdvantageIcon 
                          advantage={advantage.icon} 
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
            <Card className="max-w-4xl mx-auto border-0 shadow-lg bg-gradient-to-r from-primary/5 to-primary-600/5">
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Icon icon={Shield} size={24} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Специализированный сервис для здоровья
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  Мы понимаем специфику работы со здоровьем и психикой. Не просто &quot;найти специалиста&quot;, 
                  а найти ПРАВИЛЬНОГО специалиста — того, кто действительно поможет решить вашу задачу.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
