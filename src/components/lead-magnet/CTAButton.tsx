/**
 * CTA кнопка для действия с лид-магнитом (скачать/смотреть/записаться)
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink, Calendar, Loader2, Coins } from 'lucide-react'
import { LeadMagnetRequestModal } from '@/components/specialist/LeadMagnetRequestModal'
import { PurchaseConfirmModal } from './PurchaseConfirmModal'
import { AuthRequiredModal } from './AuthRequiredModal'
import { useUser } from '@/hooks/useUser'
import type { LeadMagnetUI } from '@/types/lead-magnet'

interface CTAButtonProps {
  leadMagnet: LeadMagnetUI
  specialistId: string
  specialistName: string
  hasPurchased?: boolean
  onPurchaseSuccess?: () => void
}

export function CTAButton({ leadMagnet, specialistId, specialistName, hasPurchased = false, onPurchaseSuccess }: CTAButtonProps) {
  const { isAuthenticated } = useUser()
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [localHasPurchased, setLocalHasPurchased] = useState(hasPurchased)

  // Синхронизируем локальное состояние с prop при изменении
  useEffect(() => {
    setLocalHasPurchased(hasPurchased)
  }, [hasPurchased])

  const priceInPoints = leadMagnet.priceInPoints
  const isPaid = typeof priceInPoints === 'number' && priceInPoints > 0
  const isFree = !isPaid
  const isPurchased = localHasPurchased || hasPurchased

  const trackAction = async (action: 'view' | 'download') => {
    setIsTracking(true)
    try {
      await fetch(`/api/lead-magnets/${leadMagnet.id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
    } catch (error) {
      console.error('Ошибка трекинга:', error)
    } finally {
      setIsTracking(false)
    }
  }

  const handleClick = async () => {
    // Унифицированная логика для всех типов

    // Если платный и не куплено - показываем модалку покупки
    if (isPaid && !isPurchased) {
      if (!isAuthenticated) {
        setIsAuthModalOpen(true)
        return
      }
      setIsPurchaseModalOpen(true)
      return
    }

    // Если куплено или бесплатный - даем доступ
    if (isPurchased || isFree) {
      // Для типа service - открываем форму записи
      if (leadMagnet.type === 'service') {
        setIsRequestModalOpen(true)
        return
      }

      // Для file/link - открываем файл/ссылку
      if (leadMagnet.type === 'file' && leadMagnet.fileUrl) {
        await trackAction('download')
        window.open(leadMagnet.fileUrl, '_blank')
      } else if (leadMagnet.type === 'link' && leadMagnet.linkUrl) {
        await trackAction('view')
        window.open(leadMagnet.linkUrl, '_blank')
      }
    }
  }

  const handlePurchaseSuccessCallback = (accessUrl?: string | null) => {
    // Обновляем локальное состояние покупки
    setLocalHasPurchased(true)
    
    // Для типа service - показываем форму записи вместо открытия URL
    if (leadMagnet.type === 'service') {
      setIsRequestModalOpen(true)
      // Вызываем callback для обновления состояния на странице
      if (onPurchaseSuccess) {
        onPurchaseSuccess()
      }
      return
    }

    // Для file/link - открываем файл/ссылку (если есть)
    if (accessUrl) {
      window.open(accessUrl, '_blank')
    }
    
    // Вызываем callback для обновления состояния на странице
    if (onPurchaseSuccess) {
      onPurchaseSuccess()
    }
  }

  const getButtonLabel = () => {
    // Если платный и не куплено - показываем кнопку покупки
    if (isPaid && !isPurchased) {
      return `Купить за ${priceInPoints} баллов`
    }

    // Если куплено или бесплатный - показываем действие доступа
    if (isPurchased || isFree) {
      switch (leadMagnet.type) {
        case 'file': return 'Открыть файл'
        case 'link': return 'Открыть ссылку'
        case 'service': return 'Записаться'
        default: return 'Открыть'
      }
    }

    // Fallback
    return 'Получить'
  }

  const getButtonIcon = () => {
    // Если платный и не куплено - иконка покупки
    if (isPaid && !isPurchased) {
      return Coins
    }

    // Если куплено или бесплатный - иконка действия
    switch (leadMagnet.type) {
      case 'file': return Download
      case 'link': return ExternalLink
      case 'service': return Calendar
      default: return Download
    }
  }

  const Icon = getButtonIcon()

  return (
    <>
      {/* Мобильный: sticky внизу, Десктоп: обычная */}
      <div className="fixed md:relative bottom-0 left-0 right-0 p-4 bg-white border-t md:border-t-0 border-gray-200 md:p-0">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleClick}
            disabled={isTracking}
            size="lg"
            className="w-full gap-2 text-base font-semibold"
          >
            {isTracking ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Icon size={20} />
                {getButtonLabel()}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Модалка для услуг (показываем только если куплено или бесплатный) */}
      {leadMagnet.type === 'service' && (isPurchased || isFree) && (
        <LeadMagnetRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          specialistId={specialistId}
          specialistName={specialistName}
          leadMagnet={leadMagnet}
        />
      )}

      {/* Модалка подтверждения покупки (показываем только если платный и не куплено) */}
      {isPaid && !isPurchased && (
        <PurchaseConfirmModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          leadMagnet={leadMagnet}
          onSuccess={handlePurchaseSuccessCallback}
        />
      )}

      {/* Модалка для неавторизованных */}
      {isPaid && (
        <AuthRequiredModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          leadMagnetTitle={leadMagnet.title}
          priceInPoints={priceInPoints}
        />
      )}
    </>
  )
}

