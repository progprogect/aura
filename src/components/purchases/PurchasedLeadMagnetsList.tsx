/**
 * Список купленных лид-магнитов пользователя
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink, Calendar, Gift } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'
import type { LeadMagnetUI } from '@/types/lead-magnet'

interface PurchasedLeadMagnet {
  purchaseId: string
  purchasedAt: string
  priceInPoints: number
  pointsSpent: number
  leadMagnet: LeadMagnetUI
  specialist: {
    slug: string
    name: string
    avatar?: string | null
  }
}

interface PurchasedLeadMagnetsResponse {
  leadMagnets: PurchasedLeadMagnet[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function PurchasedLeadMagnetsList() {
  const [leadMagnets, setLeadMagnets] = useState<PurchasedLeadMagnet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const fetchLeadMagnets = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/user/lead-magnets?page=${pagination.page}&limit=${pagination.limit}`)
      const data: PurchasedLeadMagnetsResponse = await response.json()

      if (response.ok) {
        setLeadMagnets(data.leadMagnets)
        setPagination(data.pagination)
      } else {
        setError(data.error || 'Ошибка загрузки лид-магнитов')
      }
    } catch (err) {
      console.error('Ошибка:', err)
      setError('Произошла ошибка при загрузке лид-магнитов')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeadMagnets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page])

  const handleOpen = async (leadMagnet: LeadMagnetUI) => {
    // Прямой доступ к URL (для купленных лид-магнитов)
    const accessUrl = leadMagnet.type === 'file' 
      ? leadMagnet.fileUrl 
      : leadMagnet.linkUrl

    if (accessUrl) {
      window.open(accessUrl, '_blank')
    } else {
      // Если URL нет, пытаемся получить через API
      try {
        const response = await fetch(`/api/lead-magnets/${leadMagnet.id}/purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        const data = await response.json()

        if (response.ok && data.success && data.accessUrl) {
          window.open(data.accessUrl, '_blank')
        } else {
          alert(data.error || 'Ошибка открытия лид-магнита')
        }
      } catch (error) {
        console.error('Ошибка открытия лид-магнита:', error)
        alert('Произошла ошибка при открытии лид-магнита')
      }
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'file': return Download
      case 'link': return ExternalLink
      case 'service': return Calendar
      default: return Gift
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchLeadMagnets} className="mt-4">
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (leadMagnets.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Покупок лид-магнитов пока нет
          </h3>
          <p className="text-gray-600 mb-6">
            Купите лид-магниты у наших специалистов и они появятся здесь
          </p>
          <Button asChild>
            <a href="/specialists">Найти специалистов</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {leadMagnets.map((item) => {
        const Icon = getIcon(item.leadMagnet.type)
        const accessUrl = item.leadMagnet.type === 'file' 
          ? item.leadMagnet.fileUrl 
          : item.leadMagnet.linkUrl

        return (
          <Card key={item.purchaseId} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Превью */}
                <div className="flex-shrink-0">
                  {item.leadMagnet.previewUrls?.card ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.leadMagnet.previewUrls.card}
                        alt={item.leadMagnet.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-4xl">
                      {item.leadMagnet.emoji || '🎁'}
                    </div>
                  )}
                </div>

                {/* Информация */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {item.leadMagnet.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.leadMagnet.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link
                          href={`/specialist/${item.specialist.slug}`}
                          className="hover:text-gray-900 hover:underline"
                        >
                          {item.specialist.name}
                        </Link>
                        <span>•</span>
                        <span>
                          Куплено {formatDistanceToNow(new Date(item.purchasedAt), { addSuffix: true, locale: ru })}
                        </span>
                        <span>•</span>
                        <span>{item.pointsSpent} баллов</span>
                      </div>
                    </div>
                  </div>

                  {/* Кнопки действий */}
                  <div className="flex gap-2 flex-wrap mt-4">
                    <Button
                      size="sm"
                      onClick={() => handleOpen(item.leadMagnet)}
                      className="gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.leadMagnet.type === 'file' ? 'Скачать' : item.leadMagnet.type === 'link' ? 'Открыть ссылку' : 'Записаться'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/specialist/${item.specialist.slug}/resources/${item.leadMagnet.slug}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Страница лид-магнита
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/specialist/${item.specialist.slug}`}>
                        Профиль специалиста
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Пагинация */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
          >
            Назад
          </Button>
          <span className="text-sm text-gray-600">
            Страница {pagination.page} из {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= pagination.pages}
          >
            Вперед
          </Button>
        </div>
      )}
    </div>
  )
}

