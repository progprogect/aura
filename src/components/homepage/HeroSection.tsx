/**
 * Hero секция главной страницы с AI-демо
 * Воздушный дизайн с интерактивным чат-виджетом и популярными специалистами
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { UnifiedNavigation } from '../UnifiedNavigation'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, FileText, ChevronRight, X, Search } from 'lucide-react'
import { RequestQuiz } from '@/components/requests/RequestQuiz'
import { cn } from '@/lib/utils'

const HERO_CARDS = [
  {
    title: 'Изучить материалы',
    description: 'Библиотека экспертных материалов для вашего развития',
    icon: BookOpen,
    href: '/library',
    color: 'bg-blue-50 text-blue-600',
    action: 'link'
  },
  {
    title: 'Найти специалиста',
    description: 'Каталог проверенных психологов, тренеров и коучей',
    icon: Users,
    href: '/catalog',
    color: 'bg-purple-50 text-purple-600',
    action: 'link'
  },
  {
    title: 'Оставить заявку',
    description: 'Опишите задачу, и эксперты сами предложат решение',
    icon: FileText,
    href: '#',
    color: 'bg-green-50 text-green-600',
    action: 'quiz'
  }
]

const QUICK_CATEGORIES = [
  { label: 'Психология', href: '/catalog?category=psychology' },
  { label: 'Фитнес', href: '/catalog?category=fitness' },
  { label: 'Нутрициология', href: '/catalog?category=nutrition' },
  { label: 'Коучинг', href: '/catalog?category=coaching' },
]

export function HeroSection() {
  const [showRequestQuiz, setShowRequestQuiz] = useState(false)
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white pb-20 md:pb-24">
      {/* Интегрированная навигация */}
      <UnifiedNavigation variant="hero" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-20 md:pt-24 pb-8">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Заголовок */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
              Ваша экосистема <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                саморазвития
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Находите экспертов, изучайте полезные материалы и достигайте целей. 
              Всё необходимое для гармоничного роста — в одной платформе.
            </p>
          </motion.div>

          {/* Карточки действий */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto"
          >
            {HERO_CARDS.map((card, index) => (
              <div
                key={index}
                className="group relative flex flex-col p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-300 cursor-pointer text-left"
                onClick={() => card.action === 'quiz' && setShowRequestQuiz(true)}
              >
                {card.action === 'link' ? (
                  <Link href={card.href} className="absolute inset-0 z-10" aria-label={card.title} />
                ) : null}
                
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", card.color)}>
                  <card.icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-2 flex items-center group-hover:text-primary transition-colors">
                  {card.title}
                  <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Быстрые категории */}
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.6, delay: 0.4 }}
             className="flex flex-wrap justify-center gap-2 items-center"
          >
            <span className="text-sm text-muted-foreground mr-2">Популярное:</span>
            {QUICK_CATEGORIES.map((cat) => (
              <Link 
                key={cat.href} 
                href={cat.href}
                className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
              >
                {cat.label}
              </Link>
            ))}
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
              <div className="relative w-full md:w-[800px] max-h-[90vh] md:max-h-[85vh] overflow-y-auto bg-white rounded-t-2xl md:rounded-2xl shadow-2xl pointer-events-auto safe-area-inset-bottom md:safe-area-inset-bottom-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm touch-manipulation min-h-[44px] min-w-[44px]"
                  onClick={() => setShowRequestQuiz(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <RequestQuiz
                  onClose={() => setShowRequestQuiz(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}
