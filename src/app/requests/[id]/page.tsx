/**
 * Страница деталей заявки с откликами
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProposalCard } from '@/components/requests/ProposalCard'
import { ProposalForm } from '@/components/requests/ProposalForm'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Loader2, AlertCircle, Wallet, Calendar } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ReviewModal } from '@/components/reviews/ReviewModal'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { BreadcrumbItem } from '@/lib/navigation/types'
import { RequestStatusBadge } from '@/components/requests/RequestStatusBadge'
import Link from 'next/link'

interface RequestDetail {
  id: string
  title: string
  description: string
  category: string
  budget: number | null
  status: string
  createdAt: string
  proposals: Array<{
    id: string
    message: string
    proposedPrice: number
    createdAt: string
    status: string
    specialist: {
      id: string
      slug: string
      user: {
        firstName: string
        lastName: string
        avatar: string | null
      }
      verified: boolean
    }
  }>
  user: {
    id: string
    firstName: string
    lastName: string
  }
  canRespond?: boolean
  order?: {
    id: string
    status: string
    pointsUsed: number
  } | null
}


export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string
  
  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [acceptingProposalId, setAcceptingProposalId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Record<string, { emoji: string; name: string }>>({})
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [proposalToAccept, setProposalToAccept] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Загрузка категорий
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          const catMap: Record<string, { emoji: string; name: string }> = {}
          data.categories.forEach((cat: any) => {
            catMap[cat.key] = { emoji: cat.emoji, name: cat.name }
          })
          setCategories(catMap)
        }
      })
  }, [])

  // Загрузка заявки
  useEffect(() => {
    if (!requestId) return

    setLoading(true)
    setError('')

    fetch(`/api/requests/${requestId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRequest(data.request)
        } else {
          setError(data.error || 'Заявка не найдена')
        }
      })
      .catch(() => {
        setError('Произошла ошибка при загрузке заявки')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [requestId])

  const handleAcceptProposalClick = (proposalId: string) => {
    setProposalToAccept(proposalId)
    setShowAcceptConfirm(true)
  }

  const handleAcceptProposal = async () => {
    if (!proposalToAccept) return

    setAcceptingProposalId(proposalToAccept)
    setShowAcceptConfirm(false)

    try {
      const response = await fetch(`/api/proposals/${proposalToAccept}/accept`, {
        method: 'PATCH'
      })

      const data = await response.json()

      if (data.success) {
        // Обновляем заявку
        const updatedResponse = await fetch(`/api/requests/${requestId}`)
        const updatedData = await updatedResponse.json()
        if (updatedData.success) {
          setRequest(updatedData.request)
        }
        
        // Редирект на страницу покупок
        router.push('/purchases')
        return
      } else {
        setErrorMessage(data.error || 'Ошибка при принятии отклика')
      }
    } catch (error) {
      setErrorMessage('Произошла ошибка. Попробуйте еще раз.')
    } finally {
      setAcceptingProposalId(null)
      setProposalToAccept(null)
    }
  }

  const handleCancelRequestClick = () => {
    setShowCancelConfirm(true)
  }

  const handleCancelRequest = async () => {
    setCancelling(true)
    setShowCancelConfirm(false)

    try {
      const response = await fetch(`/api/requests/${requestId}/cancel`, {
        method: 'PATCH'
      })

      const data = await response.json()

      if (data.success) {
        router.push('/requests')
      } else {
        setErrorMessage(data.error || 'Ошибка при отмене заявки')
      }
    } catch (error) {
      setErrorMessage('Произошла ошибка. Попробуйте еще раз.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-background">
        <Breadcrumbs items={[
          { label: 'Главная', href: '/' },
          { label: 'Мои заявки', href: '/requests' },
        ]} />
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || 'Заявка не найдена'}</AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
              <Link href="/requests">Вернуться к списку</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const category = categories[request.category]
  const date = new Date(request.createdAt)
  const formattedDate = format(date, 'd MMMM yyyy, HH:mm', { locale: ru })

  // Breadcrumbs для навигации
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Главная', href: '/' },
    { label: 'Мои заявки', href: '/requests' },
    { label: request.title, isActive: true },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      <div className="py-6 sm:py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">

        {/* Детали заявки */}
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-2xl flex-1">{request.title}</CardTitle>
              <RequestStatusBadge status={request.status} />
            </div>
            {request.status === 'open' && (
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancelRequestClick}
                  disabled={cancelling}
                >
                  {cancelling ? 'Отменяем...' : 'Отменить заявку'}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {category && <span className="text-base">{category.emoji}</span>}
              <span>{category?.name || request.category}</span>
            </div>

            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {request.description}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-4 border-t">
              {request.budget ? (
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{request.budget} баллов</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <span>Бюджет не указан</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Кнопка отклика для специалистов */}
        {request.canRespond && request.status === 'open' && (
          <Card>
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Хотите откликнуться?</h3>
                  <p className="text-sm text-muted-foreground">
                    Расскажите, почему вы подходите для этой заявки
                  </p>
                </div>
                <Button 
                  onClick={() => setShowProposalForm(true)}
                  className="w-full sm:w-auto sm:flex-shrink-0"
                >
                  Откликнуться
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Отклики */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            Отклики ({request.proposals.length})
          </h2>

          {request.proposals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Пока нет откликов
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {request.proposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  {...proposal}
                  isOwner={request.status === 'open'} // Только владелец может принимать отклики на открытые заявки
                  onAccept={() => handleAcceptProposalClick(proposal.id)}
                  accepting={acceptingProposalId === proposal.id}
                />
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Модальное окно формы отклика */}
      <Dialog
        isOpen={showProposalForm}
        onClose={() => setShowProposalForm(false)}
        title="Отклик на заявку"
      >
        <ProposalForm
          requestId={requestId}
          requestBudget={request.budget}
          onSuccess={() => {
            setShowProposalForm(false)
            // Обновляем данные заявки
            fetch(`/api/requests/${requestId}`)
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  setRequest(data.request)
                }
              })
          }}
          onCancel={() => setShowProposalForm(false)}
        />
      </Dialog>

      {/* Модальное окно подтверждения принятия отклика */}
      <ConfirmDialog
        isOpen={showAcceptConfirm}
        onClose={() => {
          setShowAcceptConfirm(false)
          setProposalToAccept(null)
        }}
        onConfirm={handleAcceptProposal}
        title="Принять отклик?"
        message="Вы уверены, что хотите принять этот отклик? После принятия остальные отклики будут автоматически отклонены."
        confirmText="Принять"
        cancelText="Отмена"
      />

      {/* Модальное окно подтверждения отмены заявки */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelRequest}
        title="Отменить заявку?"
        message="Вы уверены, что хотите отменить эту заявку? Все отклики будут отклонены."
        confirmText="Отменить"
        cancelText="Нет"
        variant="destructive"
      />

      {/* Модальное окно ошибки */}
      {errorMessage && (
        <Dialog
          isOpen={!!errorMessage}
          onClose={() => setErrorMessage(null)}
          title="Ошибка"
          footer={
            <Button onClick={() => setErrorMessage(null)}>
              Закрыть
            </Button>
          }
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </Dialog>
      )}

      {/* Модальное окно отзыва */}
      {request.order && (
        <ReviewModal
          orderId={request.order.id}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false)
            // Обновляем данные заявки
            fetch(`/api/requests/${requestId}`)
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  setRequest(data.request)
                }
              })
          }}
        />
      )}
    </div>
  )
}

