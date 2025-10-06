/**
 * Карточка специалиста в чате (улучшенная версия)
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Award, Video, MapPinOff, Sparkles, Search } from 'lucide-react'
import { categoryConfigService, type CategoryConfig } from '@/lib/category-config'
import { motion } from 'framer-motion'

interface SpecialistRecommendationProps {
  specialist: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    slug: string
    category: string
    specializations: string[]
    tagline?: string
    yearsOfPractice?: number
    workFormats: string[]
    city?: string
    priceFrom?: number
    verified: boolean
    similarity?: number | null
    matchReasons?: string[]
  }
  sessionId?: string
  index?: number // для staggered анимации
  onFindSimilar?: (specialistId: string) => void
}

export function SpecialistRecommendation({ 
  specialist, 
  sessionId, 
  index = 0,
  onFindSimilar 
}: SpecialistRecommendationProps) {
  const [categoryConfig, setCategoryConfig] = useState<CategoryConfig | null>(null)
  const fullName = `${specialist.firstName} ${specialist.lastName}`

  useEffect(() => {
    categoryConfigService.getCategoryConfig(specialist.category).then(setCategoryConfig).catch(() => {
      setCategoryConfig({ key: specialist.category, name: specialist.category, emoji: '✨', priceLabel: 'за услугу', fields: {} })
    })
  }, [specialist.category])

  const handleProfileClick = () => {
    if (sessionId) {
      // Трекаем клик через API (fire-and-forget)
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'profile_clicked',
          sessionId,
          metadata: { specialistId: specialist.id },
        }),
      }).catch((error) => {
        console.error('[Analytics] Failed to track profile click:', error)
      })
    }
  }

  const handleFindSimilar = () => {
    if (onFindSimilar) {
      onFindSimilar(specialist.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1, // staggered появление
        ease: [0.22, 1, 0.36, 1] // smooth ease-out
      }}
      className="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-card"
    >
      {/* Similarity badge - если есть */}
      {specialist.similarity !== null && specialist.similarity !== undefined && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 border-b border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary">
              {specialist.similarity}% совпадение с вашим запросом
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex gap-4">
          {/* Аватар */}
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted">
              {specialist.avatar ? (
                <Image
                  src={specialist.avatar}
                  alt={fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-muted-foreground">
                  {specialist.firstName[0]}{specialist.lastName[0]}
                </div>
              )}
            </div>
          </div>

          {/* Информация */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {fullName}
                  {specialist.verified && (
                    <Badge variant="default" className="text-xs py-0">
                      Проверен
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {categoryConfig?.name || specialist.category}
                </p>
              </div>
            </div>

            {/* Специализации */}
            {specialist.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {specialist.specializations.slice(0, 3).map((spec, index) => (
                  <span
                    key={index}
                    className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium"
                  >
                    {spec}
                  </span>
                ))}
                {specialist.specializations.length > 3 && (
                  <span className="text-xs px-2.5 py-1 bg-muted text-muted-foreground rounded-full">
                    +{specialist.specializations.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Слоган */}
            {specialist.tagline && (
              <p className="text-sm text-foreground/80 mb-3 line-clamp-2">
                {specialist.tagline}
              </p>
            )}

            {/* Детали */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
              {specialist.yearsOfPractice && (
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  {specialist.yearsOfPractice} {getPluralYears(specialist.yearsOfPractice)} опыта
                </span>
              )}
              {specialist.workFormats.includes('online') && (
                <span className="flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" />
                  Онлайн
                </span>
              )}
              {specialist.city ? (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {specialist.city}
                </span>
              ) : specialist.workFormats.includes('offline') && (
                <span className="flex items-center gap-1">
                  <MapPinOff className="w-3.5 h-3.5" />
                  Оффлайн
                </span>
              )}
            </div>

            {/* Объяснение почему подобрали */}
            {specialist.matchReasons && specialist.matchReasons.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-foreground/70 mb-1.5">
                  💡 Почему подобрали:
                </p>
                <div className="space-y-1">
                  {specialist.matchReasons.map((reason, idx) => (
                    <p key={idx} className="text-xs text-foreground/60 flex items-center gap-1.5">
                      <span className="text-primary">✓</span>
                      {reason}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Цена и кнопки */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                {specialist.priceFrom ? (
                  <span className="text-base font-semibold text-foreground">
                    от {Math.floor(specialist.priceFrom / 100)} ₽
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Цена по запросу</span>
                )}
              </div>
              
              <div className="flex gap-2">
                {onFindSimilar && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleFindSimilar}
                    className="gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Найти похожих</span>
                  </Button>
                )}
                <Button size="sm" asChild>
                  <Link 
                    href={`/specialist/${specialist.slug}`}
                    onClick={handleProfileClick}
                  >
                    Смотреть профиль
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function getPluralYears(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return 'год'
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'года'
  return 'лет'
}
