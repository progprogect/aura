/**
 * Карточка специалиста в чате
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Award, Video, MapPinOff } from 'lucide-react'
import { categoryConfigService, type CategoryConfig } from '@/lib/category-config'
import { trackChatEvent, ChatEvent } from '@/lib/analytics/chat-analytics'

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
  }
  sessionId?: string
}

export function SpecialistRecommendation({ specialist, sessionId }: SpecialistRecommendationProps) {
  const [categoryConfig, setCategoryConfig] = useState<CategoryConfig | null>(null)
  const fullName = `${specialist.firstName} ${specialist.lastName}`

  useEffect(() => {
    categoryConfigService.getCategoryConfig(specialist.category).then(setCategoryConfig).catch(() => {
      setCategoryConfig({ key: specialist.category, name: specialist.category, emoji: '✨', priceLabel: 'за услугу', fields: {} })
    })
  }, [specialist.category])

  const handleProfileClick = () => {
    if (sessionId) {
      trackChatEvent(ChatEvent.PROFILE_CLICKED, sessionId, {
        specialistId: specialist.id,
      })
    }
  }

  return (
    <div className="bg-background border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
      <div className="flex gap-3">
        {/* Аватар */}
        <div className="shrink-0">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-muted">
            {specialist.avatar ? (
              <Image
                src={specialist.avatar}
                alt={fullName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xl font-semibold">
                {specialist.firstName[0]}{specialist.lastName[0]}
              </div>
            )}
          </div>
        </div>

        {/* Информация */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-semibold text-base flex items-center gap-2">
                {fullName}
                {specialist.verified && (
                  <Badge variant="default" className="text-xs">
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
            <div className="flex flex-wrap gap-1 mb-2">
              {specialist.specializations.slice(0, 3).map((spec, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          {/* Слоган */}
          {specialist.tagline && (
            <p className="text-sm text-foreground/80 mb-2 line-clamp-2">
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

          {/* Цена и кнопка */}
          <div className="flex items-center justify-between gap-2">
            {specialist.priceFrom ? (
              <span className="text-sm font-semibold">
                от {Math.floor(specialist.priceFrom / 100)} ₽
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Цена по запросу</span>
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
  )
}

function getPluralYears(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return 'год'
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'года'
  return 'лет'
}

