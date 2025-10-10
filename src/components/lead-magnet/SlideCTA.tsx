'use client'

import { motion } from 'framer-motion'
import { Download, ExternalLink, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LeadMagnet } from '@/types/lead-magnet'

interface SlideCTAProps {
  leadMagnet: Pick<LeadMagnet, 'type' | 'fileUrl' | 'linkUrl' | 'title' | 'downloadCount'>
  specialistId: string
  specialistSlug: string
  specialistName: string
  className?: string
}

// Компонент для главной кнопки CTA (консистентный стиль)
function CTAButton({ 
  leadMagnet, 
  specialistId, 
  specialistName 
}: {
  leadMagnet: Pick<LeadMagnet, 'type' | 'fileUrl' | 'linkUrl' | 'title'>
  specialistId: string
  specialistName: string
}) {
  const getButtonConfig = () => {
    switch (leadMagnet.type) {
      case 'file':
        return {
          text: 'Скачать файл',
          icon: Download,
        }
      case 'link':
        return {
          text: 'Перейти по ссылке',
          icon: ExternalLink,
        }
      case 'service':
        return {
          text: 'Записаться на консультацию',
          icon: MessageCircle,
        }
      default:
        return {
          text: 'Получить доступ',
          icon: Download,
        }
    }
  }

  const handleClick = () => {
    // Логика обработки клика в зависимости от типа
    switch (leadMagnet.type) {
      case 'file':
        if (leadMagnet.fileUrl) {
          window.open(leadMagnet.fileUrl, '_blank')
        }
        break
      case 'link':
        if (leadMagnet.linkUrl) {
          window.open(leadMagnet.linkUrl, '_blank')
        }
        break
      case 'service':
        console.log('Запись на консультацию к', specialistName)
        break
    }
  }

  const { text, icon: Icon } = getButtonConfig()

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white rounded-xl transition-colors duration-200",
        "bg-blue-600 hover:bg-blue-700",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2",
        "w-full md:w-auto md:min-w-[200px]"
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{text}</span>
    </motion.button>
  )
}

// Компонент для социального доказательства (минималистичный)
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
      transition={{ duration: 0.3, delay: 0.3 }}
      className="flex items-center gap-2 text-sm text-gray-600"
    >
      <div className="flex items-center gap-1">
        <Download className="w-4 h-4 text-gray-400" />
        <span className="font-medium text-gray-900">{downloadCount}</span>
      </div>
      <span>скачиваний</span>
    </motion.div>
  )
}

// Дополнительные действия убраны для фокуса на главной CTA

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
      className={cn("space-y-4", className)}
    >
      {/* Главная кнопка CTA - выравнивание по левому краю */}
      <div className="flex justify-start">
        <CTAButton
          leadMagnet={leadMagnet}
          specialistId={specialistId}
          specialistName={specialistName}
        />
      </div>

      {/* Социальное доказательство - тоже слева */}
      <div className="flex justify-start">
        <SocialProof downloadCount={leadMagnet.downloadCount} />
      </div>
    </motion.div>
  )
}
