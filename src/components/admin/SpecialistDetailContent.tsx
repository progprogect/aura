/**
 * Контент страницы детального просмотра специалиста
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog } from '@/components/ui/dialog'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Coins,
  ArrowLeft,
  User,
  Shield,
  ShieldOff,
  Ban,
  Unlock,
  Eye,
} from 'lucide-react'
import Link from 'next/link'
import { useToast, ToastContainer } from '@/components/ui/toast'

interface SpecialistDetail {
  id: string
  slug: string
  category: string
  specializations: string[]
  verified: boolean
  verifiedAt: string | null
  blocked: boolean
  blockedAt: string | null
  blockedReason: string | null
  acceptingClients: boolean
  profileViews: number
  contactViews: number
  averageRating: number
  totalReviews: number
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    phone: string
    email: string | null
    avatar: string | null
    blocked: boolean
    blockedAt: string | null
    blockedReason: string | null
    balance: string
    bonusBalance: string
  }
  education: Array<{
    id: string
    institution: string
    degree: string
    year: number
  }>
  certificates: Array<{
    id: string
    title: string
    organization: string
    year: number
  }>
  services: Array<{
    id: string
    title: string
    price: number
  }>
  orders: Array<{
    id: string
    status: string
    createdAt: string
    service: {
      title: string
    }
  }>
  reviews: Array<{
    id: string
    rating: number
    comment: string | null
    createdAt: string
    user: {
      firstName: string
      lastName: string
    }
  }>
  transactions: Array<{
    id: string
    type: string
    amount: string
    description: string | null
    createdAt: string
  }>
  ordersStats: Array<{
    status: string
    count: number
  }>
}

export function SpecialistDetailContent({
  specialistId,
}: {
  specialistId: string
}) {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [specialist, setSpecialist] = useState<SpecialistDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Модальные окна
  const [pointsModalOpen, setPointsModalOpen] = useState(false)
  const [pointsAmount, setPointsAmount] = useState('')
  const [pointsReason, setPointsReason] = useState('')
  const [blockModalOpen, setBlockModalOpen] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [blockType, setBlockType] = useState<'specialist' | 'user'>('specialist')

  const fetchSpecialist = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/specialists/${specialistId}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка загрузки специалиста')
      }

      setSpecialist(data.specialist)
    } catch (err: any) {
      console.error('Ошибка загрузки специалиста:', err)
      setError(err.message || 'Ошибка загрузки специалиста')
    } finally {
      setLoading(false)
    }
  }, [specialistId])

  useEffect(() => {
    fetchSpecialist()
  }, [fetchSpecialist])

  const handleVerify = async (verified: boolean) => {
    setActionLoading('verify')
    try {
      const response = await fetch(
        `/api/admin/specialists/${specialistId}/verify`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verified }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка верификации')
      }

      addToast({
        type: 'success',
        title: verified ? 'Специалист верифицирован' : 'Верификация снята',
      })

      fetchSpecialist()
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Ошибка',
        description: err.message,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleBlockSpecialist = async (blocked: boolean) => {
    setActionLoading('block-specialist')
    try {
      const response = await fetch(
        `/api/admin/specialists/${specialistId}/block`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocked, reason: blockReason || null }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка блокировки')
      }

      addToast({
        type: 'success',
        title: blocked ? 'Профиль заблокирован' : 'Профиль разблокирован',
      })

      setBlockModalOpen(false)
      setBlockReason('')
      fetchSpecialist()
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Ошибка',
        description: err.message,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleBlockUser = async (blocked: boolean) => {
    if (!specialist) return

    setActionLoading('block-user')
    try {
      const response = await fetch(
        `/api/admin/users/${specialist.user.id}/block`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocked, reason: blockReason || null }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка блокировки')
      }

      addToast({
        type: 'success',
        title: blocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
      })

      setBlockModalOpen(false)
      setBlockReason('')
      fetchSpecialist()
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Ошибка',
        description: err.message,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddPoints = async () => {
    if (!pointsAmount || parseFloat(pointsAmount) <= 0) {
      addToast({
        type: 'error',
        title: 'Ошибка',
        description: 'Введите положительное количество баллов',
      })
      return
    }

    setActionLoading('add-points')
    try {
      const response = await fetch(
        `/api/admin/specialists/${specialistId}/points`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parseFloat(pointsAmount),
            reason: pointsReason || null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка начисления баллов')
      }

      addToast({
        type: 'success',
        title: 'Баллы начислены',
        description: `Начислено ${pointsAmount} бонусных баллов`,
      })

      setPointsModalOpen(false)
      setPointsAmount('')
      setPointsReason('')
      fetchSpecialist()
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Ошибка',
        description: err.message,
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !specialist) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            {error || 'Специалист не найден'}
          </div>
          <Button
            onClick={() => router.push('/admin/specialists')}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к списку
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/specialists">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {specialist.user.firstName} {specialist.user.lastName}
            </h1>
            <p className="text-sm text-gray-600">{specialist.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {specialist.verified ? (
            <Button
              variant="outline"
              onClick={() => handleVerify(false)}
              disabled={actionLoading === 'verify'}
            >
              <ShieldOff className="h-4 w-4 mr-2" />
              Снять верификацию
            </Button>
          ) : (
            <Button
              onClick={() => handleVerify(true)}
              disabled={actionLoading === 'verify'}
            >
              <Shield className="h-4 w-4 mr-2" />
              Верифицировать
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setBlockType('specialist')
              setBlockModalOpen(true)
            }}
          >
            <Ban className="h-4 w-4 mr-2" />
            {specialist.blocked ? 'Разблокировать профиль' : 'Заблокировать профиль'}
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setBlockType('user')
              setBlockModalOpen(true)
            }}
          >
            <Ban className="h-4 w-4 mr-2" />
            {specialist.user.blocked ? 'Разблокировать пользователя' : 'Заблокировать пользователя'}
          </Button>

          <Button
            onClick={() => setPointsModalOpen(true)}
            disabled={actionLoading !== null}
          >
            <Coins className="h-4 w-4 mr-2" />
            Добавить баллы
          </Button>
        </div>
      </div>

      {/* Основная информация */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Статусы */}
          <Card>
            <CardHeader>
              <CardTitle>Статусы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Верификация:</span>
                {specialist.verified ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Верифицирован
                  </Badge>
                ) : (
                  <Badge variant="secondary">Не верифицирован</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Профиль специалиста:</span>
                {specialist.blocked ? (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Заблокирован
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Активен
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Пользователь:</span>
                {specialist.user.blocked ? (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Заблокирован
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Активен
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Принимает клиентов:</span>
                {specialist.acceptingClients ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Да
                  </Badge>
                ) : (
                  <Badge variant="secondary">Нет</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Информация о пользователе */}
          <Card>
            <CardHeader>
              <CardTitle>Информация о пользователе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <span className="font-medium">Имя:</span> {specialist.user.firstName} {specialist.user.lastName}
              </p>
              <p>
                <span className="font-medium">Телефон:</span> {specialist.user.phone}
              </p>
              {specialist.user.email && (
                <p>
                  <span className="font-medium">Email:</span> {specialist.user.email}
                </p>
              )}
              <p>
                <span className="font-medium">Баланс:</span> {parseFloat(specialist.user.balance).toLocaleString()} баллов
              </p>
              <p>
                <span className="font-medium">Бонусные баллы:</span> {parseFloat(specialist.user.bonusBalance).toLocaleString()} баллов
              </p>
            </CardContent>
          </Card>

          {/* Статистика */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <span className="font-medium">Просмотры профиля:</span> {specialist.profileViews}
              </p>
              <p>
                <span className="font-medium">Просмотры контактов:</span> {specialist.contactViews}
              </p>
              {specialist.totalReviews > 0 && (
                <p>
                  <span className="font-medium">Рейтинг:</span> {specialist.averageRating.toFixed(1)} ({specialist.totalReviews} отзывов)
                </p>
              )}
              <p>
                <span className="font-medium">Заказы:</span>{' '}
                {specialist.ordersStats.map((stat) => `${stat.status}: ${stat.count}`).join(', ')}
              </p>
            </CardContent>
          </Card>

          {/* Образование и сертификаты */}
          {(specialist.education.length > 0 || specialist.certificates.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Образование и сертификаты</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {specialist.education.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Образование:</h4>
                    <ul className="space-y-1">
                      {specialist.education.map((edu) => (
                        <li key={edu.id} className="text-sm text-gray-600">
                          {edu.institution} - {edu.degree} ({edu.year})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {specialist.certificates.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Сертификаты:</h4>
                    <ul className="space-y-1">
                      {specialist.certificates.map((cert) => (
                        <li key={cert.id} className="text-sm text-gray-600">
                          {cert.title} - {cert.organization} ({cert.year})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Услуги */}
          {specialist.services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Услуги</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {specialist.services.map((service) => (
                    <li key={service.id} className="text-sm">
                      {service.title} - {service.price} баллов
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Отзывы */}
          {specialist.reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Последние отзывы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {specialist.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {review.user.firstName} {review.user.lastName}
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Транзакции */}
          {specialist.transactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Последние транзакции</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {specialist.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between text-sm border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{transaction.type}</p>
                        {transaction.description && (
                          <p className="text-gray-600 text-xs">
                            {transaction.description}
                          </p>
                        )}
                        <p className="text-gray-400 text-xs">
                          {new Date(transaction.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <span className="font-medium">
                        {parseFloat(transaction.amount) > 0 ? '+' : ''}
                        {parseFloat(transaction.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Быстрые действия */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(`/specialist/${specialist.slug}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Просмотреть профиль
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Модальное окно добавления баллов */}
      <Dialog
        isOpen={pointsModalOpen}
        onClose={() => {
          setPointsModalOpen(false)
          setPointsAmount('')
          setPointsReason('')
        }}
        title="Добавить бонусные баллы"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPointsModalOpen(false)
                setPointsAmount('')
                setPointsReason('')
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleAddPoints}
              disabled={actionLoading === 'add-points' || !pointsAmount}
            >
              {actionLoading === 'add-points' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Начисление...
                </>
              ) : (
                'Начислить'
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="points-amount">Количество баллов</Label>
            <Input
              id="points-amount"
              type="number"
              min="1"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(e.target.value)}
              placeholder="100"
            />
          </div>
          <div>
            <Label htmlFor="points-reason">Причина (опционально)</Label>
            <Input
              id="points-reason"
              type="text"
              value={pointsReason}
              onChange={(e) => setPointsReason(e.target.value)}
              placeholder="Например: Компенсация за ошибку"
            />
          </div>
        </div>
      </Dialog>

      {/* Модальное окно блокировки */}
      <Dialog
        isOpen={blockModalOpen}
        onClose={() => {
          setBlockModalOpen(false)
          setBlockReason('')
        }}
        title={
          blockType === 'specialist'
            ? specialist.blocked
              ? 'Разблокировать профиль специалиста'
              : 'Заблокировать профиль специалиста'
            : specialist.user.blocked
            ? 'Разблокировать пользователя'
            : 'Заблокировать пользователя'
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setBlockModalOpen(false)
                setBlockReason('')
              }}
            >
              Отмена
            </Button>
            <Button
              variant={blockType === 'specialist' ? (specialist.blocked ? 'default' : 'destructive') : (specialist.user.blocked ? 'default' : 'destructive')}
              onClick={() => {
                if (blockType === 'specialist') {
                  handleBlockSpecialist(!specialist.blocked)
                } else {
                  handleBlockUser(!specialist.user.blocked)
                }
              }}
              disabled={
                actionLoading === 'block-specialist' ||
                actionLoading === 'block-user'
              }
            >
              {actionLoading === 'block-specialist' ||
              actionLoading === 'block-user' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : blockType === 'specialist' ? (
                specialist.blocked ? (
                  'Разблокировать'
                ) : (
                  'Заблокировать'
                )
              ) : specialist.user.blocked ? (
                'Разблокировать'
              ) : (
                'Заблокировать'
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {blockType === 'specialist'
              ? specialist.blocked
                ? 'Профиль специалиста будет разблокирован и станет видимым в каталоге'
                : 'Профиль специалиста будет заблокирован и скрыт из каталога'
              : specialist.user.blocked
              ? 'Пользователь будет разблокирован'
              : 'Пользователь будет заблокирован'}
          </p>
          <div>
            <Label htmlFor="block-reason">Причина (опционально)</Label>
            <Input
              id="block-reason"
              type="text"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Укажите причину блокировки"
            />
          </div>
        </div>
      </Dialog>

      {/* Toast контейнер */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}

