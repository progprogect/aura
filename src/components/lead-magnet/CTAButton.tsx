/**
 * CTA кнопка для действия с лид-магнитом (скачать/смотреть/записаться)
 */

'use client'

import { useState } from 'react'
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
}

export function CTAButton({ leadMagnet, specialistId, specialistName }: CTAButtonProps) {
  const { isAuthenticated } = useUser()
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isTracking, setIsTracking] = useState(false)

  const priceInPoints = leadMagnet.priceInPoints
  const isPaid = typeof priceInPoints === 'number' && priceInPoints > 0
  const isFree = !isPaid

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
    // Для типа service - всегда открываем модалку заявки
    if (leadMagnet.type === 'service') {
      setIsRequestModalOpen(true)
      return
    }

    // Для платных лид-магнитов
    if (isPaid) {
      if (!isAuthenticated) {
        setIsAuthModalOpen(true)
        return
      }
      setIsPurchaseModalOpen(true)
      return
    }

    // Для бесплатных - сразу доступ
    if (isFree) {
      if (leadMagnet.type === 'file' && leadMagnet.fileUrl) {
        await trackAction('download')
        window.open(leadMagnet.fileUrl, '_blank')
      } else if (leadMagnet.type === 'link' && leadMagnet.linkUrl) {
        await trackAction('view')
        window.open(leadMagnet.linkUrl, '_blank')
      }
    }
  }

  const handlePurchaseSuccess = (accessUrl: string) => {
    // Открываем доступ после успешной покупки
    window.open(accessUrl, '_blank')
  }

  const getButtonLabel = () => {
    if (leadMagnet.type === 'service') {
      return 'Записаться бесплатно'
    }
    
    if (isPaid) {
      return `Получить за ${priceInPoints} баллов`
    }
    
    switch (leadMagnet.type) {
      case 'file': return 'Скачать бесплатно'
      case 'link': return 'Смотреть бесплатно'
      default: return 'Получить'
    }
  }

  const getButtonIcon = () => {
    if (isPaid) {
      return Coins
    }
    
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

      {/* Модалка для услуг */}
      {leadMagnet.type === 'service' && (
        <LeadMagnetRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          specialistId={specialistId}
          specialistName={specialistName}
          leadMagnet={leadMagnet}
        />
      )}

      {/* Модалка подтверждения покупки */}
      {isPaid && (
        <PurchaseConfirmModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          leadMagnet={leadMagnet}
          onSuccess={handlePurchaseSuccess}
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

