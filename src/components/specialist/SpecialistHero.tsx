'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Eye, CheckCircle2, MessageCircle, Phone } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import { cn, formatNumber } from '@/lib/utils'
import { WORK_FORMAT_LABELS } from '@/lib/constants'

export interface SpecialistHeroProps {
  firstName: string
  lastName: string
  avatar?: string | null
  category: string
  categoryEmoji?: string // Передаем из server component
  specializations: string[]
  tagline?: string | null
  city?: string | null
  country?: string
  workFormats: string[]
  yearsOfPractice?: number | null
  verified: boolean
  profileViews: number
  onContactClick?: () => void
  onShowContactsClick?: () => void
}

export function SpecialistHero({
  firstName,
  lastName,
  avatar,
  category,
  categoryEmoji = '✨',
  specializations,
  tagline,
  city,
  country,
  workFormats,
  yearsOfPractice,
  verified,
  profileViews,
  onContactClick,
  onShowContactsClick,
}: SpecialistHeroProps) {
  const fullName = `${firstName} ${lastName}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-b border-gray-200 bg-white"
    >
      <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          {/* Аватар */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Avatar
              src={avatar || undefined}
              alt={fullName}
              size={120}
              verified={verified}
              fallback={`${firstName[0]}${lastName[0]}`}
              className="md:size-32 lg:size-36"
            />
          </motion.div>

          {/* Основная информация */}
          <div className="flex-1 text-center md:text-left">
            {/* Имя */}
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-semibold text-gray-900 md:text-3xl"
            >
              {fullName}
            </motion.h1>

            {/* Специализации и локация */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-600 md:justify-start"
            >
              {/* Основная специализация */}
              <span className="font-medium">
                {categoryEmoji} {specializations[0] || 'Специалист'}
              </span>

              {/* Разделитель */}
              <span className="text-gray-400">·</span>

              {/* Локация */}
              {city && (
                <>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {city}
                  </span>
                  <span className="text-gray-400">·</span>
                </>
              )}

              {/* Форматы работы */}
              <span className="flex items-center gap-1">
                {workFormats.map(format => WORK_FORMAT_LABELS[format] || format).join(', ')}
              </span>
            </motion.div>

            {/* Опыт работы */}
            {yearsOfPractice && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-1 text-sm text-gray-600"
              >
                {yearsOfPractice} {yearsOfPractice === 1 ? 'год' : yearsOfPractice < 5 ? 'года' : 'лет'} опыта
              </motion.div>
            )}

            {/* Tagline */}
            {tagline && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-base leading-relaxed text-gray-700"
              >
                {tagline}
              </motion.p>
            )}

            {/* Бейджи (верификация и просмотры) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-start"
            >
              {/* Верификация */}
              {verified && (
                <Badge variant="verified" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Верифицирован
                </Badge>
              )}

              {/* Просмотры */}
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Eye className="h-4 w-4" />
                {formatNumber(profileViews)} просмотров
              </span>
            </motion.div>

            {/* Дополнительные специализации (теги) */}
            {specializations.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start"
              >
                {specializations.slice(1, 4).map((spec, index) => (
                  <Tag key={index} variant="default">
                    {spec}
                  </Tag>
                ))}
              </motion.div>
            )}

            {/* Кнопки действий */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start"
            >
              <Button
                size="lg"
                onClick={onContactClick}
                className="gap-2 shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                Связаться
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={onShowContactsClick}
                className="gap-2"
              >
                <Phone className="h-4 w-4" />
                Показать контакты
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}



