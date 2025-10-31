/**
 * Hero секция главной страницы с AI-демо
 * Воздушный дизайн с интерактивным чат-виджетом и популярными специалистами
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { UnifiedNavigation } from '../UnifiedNavigation'
import { Button } from '@/components/ui/button'
import { Grid3X3, X, ChevronRight } from 'lucide-react'
import { RequestQuiz } from '@/components/requests/RequestQuiz'

export function HeroSection() {
  const [showRequestQuiz, setShowRequestQuiz] = useState(false)
  const [quizInitialCategory, setQuizInitialCategory] = useState<string | undefined>()
  const [quizInitialTitle, setQuizInitialTitle] = useState<string | undefined>()
  
  // Состояние первого шага квиза на главной странице
  const [heroQuizTitle, setHeroQuizTitle] = useState('')

  return (
    <section className="relative overflow-hidden">
      {/* Интегрированная навигация */}
      <UnifiedNavigation variant="hero" />
      
      {/* Фоновый градиент */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative pt-20 pb-8">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          {/* Заголовок */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
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

          {/* Встроенный первый шаг квиза */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col gap-4 justify-center items-stretch max-w-2xl mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Создайте заявку за 30 секунд
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Опишите, что вам нужно, и специалисты предложат свои услуги
                  </p>
                </div>
                
                <div>
                  <label htmlFor="hero-quiz-title" className="block text-sm font-medium text-foreground mb-2">
                    Что вам нужно?
                  </label>
                  <input
                    id="hero-quiz-title"
                    type="text"
                    value={heroQuizTitle}
                    onChange={(e) => setHeroQuizTitle(e.target.value)}
                    placeholder="Например: Нужен психолог для работы с тревогой"
                    maxLength={100}
                    className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-base touch-manipulation transition-all"
                    style={{ fontSize: '16px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && heroQuizTitle.trim().length >= 5) {
                        setQuizInitialTitle(heroQuizTitle.trim())
                        setShowRequestQuiz(true)
                      }
                    }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {heroQuizTitle.length}/100 символов
                    </p>
                    {heroQuizTitle.trim().length >= 5 && (
                      <p className="text-xs text-primary font-medium">
                        Нажмите Enter или кнопку ниже
                      </p>
                    )}
                  </div>
                </div>
                
                <Button
                  size="lg"
                  onClick={() => {
                    if (heroQuizTitle.trim().length >= 5) {
                      setQuizInitialTitle(heroQuizTitle.trim())
                      setShowRequestQuiz(true)
                    }
                  }}
                  disabled={heroQuizTitle.trim().length < 5}
                  className="w-full h-12 sm:h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all touch-manipulation min-h-[44px]"
                >
                  Продолжить
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                asChild 
                className="flex-1 h-12 sm:h-14 text-base font-semibold border-2 hover:bg-muted/50 transition-all touch-manipulation min-h-[44px]"
              >
                <Link href="/catalog" className="flex items-center justify-center">
                  <Grid3X3 className="w-5 h-5 mr-2" />
                  Смотреть каталог
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Дополнительная информация */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-sm text-muted-foreground"
          >
            <p>Персональный подбор • Без регистрации • Прямая связь со специалистом</p>
          </motion.div>
        </div>
      </div>

      {/* Модальное окно Quiz */}
      <AnimatePresence>
        {showRequestQuiz && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowRequestQuiz(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full md:w-auto md:max-w-3xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto bg-white rounded-t-2xl md:rounded-2xl shadow-2xl pointer-events-auto safe-area-inset-bottom md:safe-area-inset-bottom-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm touch-manipulation min-h-[44px] min-w-[44px]"
                  onClick={() => setShowRequestQuiz(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <RequestQuiz
                  defaultCategory={quizInitialCategory}
                  defaultTitle={quizInitialTitle || heroQuizTitle.trim()}
                  onClose={() => {
                    setShowRequestQuiz(false)
                    // Очищаем данные только если пользователь закрыл модальное окно
                    if (!quizInitialTitle) {
                      setHeroQuizTitle('')
                    }
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}
