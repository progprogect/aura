'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LeadMagnet } from '@/types/lead-magnet'

interface SlideCTAProps {
  leadMagnet: Pick<LeadMagnet, 'type' | 'fileUrl' | 'linkUrl' | 'title' | 'downloadCount'>
  specialistId: string
  specialistSlug: string
  specialistName: string
  className?: string
}

// Компонент для главной кнопки CTA
function CTAButton({ 
  leadMagnet, 
  specialistId, 
  specialistName 
}: {
  leadMagnet: Pick<LeadMagnet, 'type' | 'fileUrl' | 'linkUrl' | 'title'>
  specialistId: string
  specialistName: string
}) {
  const getButtonText = () => {
    switch (leadMagnet.type) {
      case 'file':
        return 'Скачать файл'
      case 'link':
        return 'Перейти по ссылке'
      case 'service':
        return 'Записаться на консультацию'
      default:
        return 'Получить доступ'
    }
  }

  const getButtonIcon = () => {
    switch (leadMagnet.type) {
      case 'file':
        return '📥'
      case 'link':
        return '🔗'
      case 'service':
        return '💬'
      default:
        return '✨'
    }
  }

  const handleClick = () => {
    // Логика обработки клика в зависимости от типа
    switch (leadMagnet.type) {
      case 'file':
        if (leadMagnet.fileUrl) {
          // Открываем файл в новой вкладке
          window.open(leadMagnet.fileUrl, '_blank')
        }
        break
      case 'link':
        if (leadMagnet.linkUrl) {
          // Открываем ссылку в новой вкладке
          window.open(leadMagnet.linkUrl, '_blank')
        }
        break
      case 'service':
        // Здесь можно открыть модальное окно для записи на консультацию
        // или перенаправить на страницу записи
        console.log('Запись на консультацию к', specialistName)
        break
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        "group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white rounded-xl shadow-lg transition-all duration-300",
        "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
        "focus:outline-none focus:ring-4 focus:ring-blue-500/50",
        "w-full md:w-auto md:min-w-[200px]"
      )}
    >
      <span className="flex items-center space-x-3">
        <span className="text-xl">{getButtonIcon()}</span>
        <span>{getButtonText()}</span>
      </span>
      
      {/* Hover эффект */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  )
}

// Компонент для социального доказательства
function SocialProof({ 
  downloadCount 
}: { 
  downloadCount?: number 
}) {
  if (!downloadCount || downloadCount < 10) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="flex items-center justify-center space-x-2 text-sm text-gray-600"
    >
      <div className="flex -space-x-1">
        {/* Аватары пользователей */}
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
          >
            {i + 1}
          </div>
        ))}
      </div>
      <span>
        Уже скачали <span className="font-semibold text-gray-900">{downloadCount}</span> человек
      </span>
    </motion.div>
  )
}

// Компонент для дополнительных действий
function AdditionalActions({ 
  specialistSlug, 
  specialistName 
}: { 
  specialistSlug: string
  specialistName: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.6 }}
      className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-sm"
    >
      <a
        href={`/specialist/${specialistSlug}`}
        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        ← Вернуться к профилю {specialistName.split(' ')[0]}
      </a>
      
      <span className="text-gray-400 hidden sm:inline">•</span>
      
      <button className="text-gray-600 hover:text-gray-700 font-medium transition-colors">
        Поделиться
      </button>
    </motion.div>
  )
}

export function SlideCTA({ 
  leadMagnet, 
  specialistId, 
  specialistSlug, 
  specialistName, 
  className 
}: SlideCTAProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn("space-y-6", className)}
    >
      {/* Главная кнопка CTA */}
      <div className="flex justify-center">
        <CTAButton
          leadMagnet={leadMagnet}
          specialistId={specialistId}
          specialistName={specialistName}
        />
      </div>

      {/* Социальное доказательство */}
      <div className="flex justify-center">
        <SocialProof downloadCount={leadMagnet.downloadCount} />
      </div>

      {/* Дополнительные действия */}
      <div className="flex justify-center">
        <AdditionalActions 
          specialistSlug={specialistSlug}
          specialistName={specialistName}
        />
      </div>
    </motion.div>
  )
}
