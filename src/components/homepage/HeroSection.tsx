/**
 * Hero секция главной страницы с AI-демо
 * Воздушный дизайн с интерактивным чат-виджетом
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icons/Icon'
import { MessageCircle, ArrowRight } from '@/components/ui/icons/catalog-icons'

export function HeroSection() {
  const [demoStep, setDemoStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  // Демо-диалог
  const demoMessages = [
    { text: "У меня тревога, помогите", isUser: true },
    { text: "Понимаю, что вы переживаете. У нас есть 3 психолога, специализирующихся на работе с тревожностью:", isUser: false },
  ]

  // Автоматическое проигрывание демо
  useEffect(() => {
    const timer = setTimeout(() => {
      if (demoStep < demoMessages.length) {
        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          setDemoStep(prev => prev + 1)
        }, 1500)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [demoStep, demoMessages.length])

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Фоновый градиент */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Заголовок */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Найди специалиста{' '}
              <span className="bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                за 2 минуты
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-помощник поможет найти идеального эксперта для решения ваших задач
            </p>
          </motion.div>

          {/* Чат-демо */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="space-y-4">
                  {/* Заголовок чата */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <Image 
                        src="/icons/chat-bubble.svg" 
                        alt="Чат-помощник" 
                        width={20} 
                        height={20} 
                        className="text-white"
                        priority
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">AI-Помощник</h3>
                      <p className="text-sm text-muted-foreground">Готов помочь найти специалиста</p>
                    </div>
                  </div>

                  {/* Сообщения */}
                  <div className="space-y-4 min-h-[120px]">
                    <AnimatePresence>
                      {demoMessages.slice(0, demoStep).map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: message.isUser ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4 }}
                          className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                              message.isUser
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-foreground'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Индикатор печати */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Результаты поиска (показываем после второго сообщения) */}
                  {demoStep >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      className="bg-gradient-to-r from-primary/10 to-primary-600/10 rounded-xl p-4 border border-primary/20"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <Image 
                            src="/icons/chat-bubble.svg" 
                            alt="Результаты поиска" 
                            width={16} 
                            height={16} 
                            className="text-primary"
                          />
                        </div>
                        <p className="text-sm font-medium text-foreground">Найдено 3 специалиста</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-white rounded-lg p-3 border border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-semibold">{i}</span>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-foreground">Психолог #{i}</p>
                                <p className="text-xs text-muted-foreground">КПТ-терапия</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Кнопки действий */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button size="lg" className="text-lg px-8 py-6 h-auto">
              <Icon icon={MessageCircle} size={20} />
              Попробовать AI
            </Button>
            <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6 h-auto">
              <Link href="/catalog">
                Смотреть каталог
                <Icon icon={ArrowRight} size={20} />
              </Link>
            </Button>
          </motion.div>

          {/* Дополнительная информация */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-sm text-muted-foreground"
          >
            <p>Обычно это занимает 2-3 минуты • Без регистрации</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
