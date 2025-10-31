/**
 * Список откликов специалиста
 */

'use client'

import { useState, useEffect } from 'react'
import { ProposalCard } from './ProposalCard'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Loader2, AlertCircle, ChevronDown, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Proposal {
  id: string
  message: string
  proposedPrice: number
  status: string
  createdAt: string
  acceptedAt?: string | null
  rejectedAt?: string | null
  withdrawnAt?: string | null
  request: {
    id: string
    title: string
    description: string
    category: string
    budget: number | null
    status: string
    createdAt: string
    user: {
      firstName: string
      lastName: string
      avatar: string | null
    }
  }
}

export function ProposalsList() {
  const router = useRouter()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)

  const statusOptions = [
    { value: 'all', label: 'Все статусы' },
    { value: 'pending', label: 'Ожидают ответа' },
    { value: 'accepted', label: 'Приняты' },
    { value: 'rejected', label: 'Отклонены' },
    { value: 'withdrawn', label: 'Отозваны' },
  ]

  const currentStatusLabel = statusOptions.find(opt => opt.value === statusFilter)?.label || 'Все статусы'

  // Загрузка откликов
  useEffect(() => {
    setLoading(true)
    setError('')

    const url = statusFilter === 'all'
      ? '/api/proposals'
      : `/api/proposals?status=${statusFilter}`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProposals(data.proposals || [])
        } else {
          setError(data.error || 'Ошибка при загрузке откликов')
        }
      })
      .catch(() => {
        setError('Произошла ошибка при загрузке откликов')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [statusFilter])

  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [proposalToWithdraw, setProposalToWithdraw] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleWithdrawClick = (proposalId: string) => {
    setProposalToWithdraw(proposalId)
    setShowWithdrawConfirm(true)
  }

  const handleWithdraw = async () => {
    if (!proposalToWithdraw) return

    setWithdrawingId(proposalToWithdraw)
    setShowWithdrawConfirm(false)

    try {
      const response = await fetch(`/api/proposals/${proposalToWithdraw}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        // Обновляем список
        setProposals(prev => prev.filter(p => p.id !== proposalToWithdraw))
      } else {
        setErrorMessage(data.error || 'Ошибка при отзыве отклика')
      }
    } catch (error) {
      setErrorMessage('Произошла ошибка. Попробуйте еще раз.')
    } finally {
      setWithdrawingId(null)
      setProposalToWithdraw(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">У вас пока нет откликов</p>
        <Button asChild>
          <a href="/find-work">Найти заявки</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Фильтр */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Мои отклики</h2>
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              {currentStatusLabel}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0">
            <div className="py-1">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setStatusFilter(option.value)
                    setIsFilterOpen(false)
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors',
                    statusFilter === option.value && 'bg-muted font-medium'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Список откликов */}
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="relative">
            <ProposalCard
              id={proposal.id}
              message={proposal.message}
              proposedPrice={proposal.proposedPrice}
              createdAt={proposal.createdAt}
              status={proposal.status}
              specialist={{
                id: '',
                slug: '',
                user: {
                  firstName: proposal.request.user.firstName,
                  lastName: proposal.request.user.lastName,
                  avatar: proposal.request.user.avatar
                },
                verified: false
              }}
            />
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">{proposal.request.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {proposal.request.description}
              </p>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={`/requests/${proposal.request.id}`}>
                    Открыть заявку
                  </a>
                </Button>
                {proposal.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWithdrawClick(proposal.id)}
                    disabled={withdrawingId === proposal.id}
                  >
                    {withdrawingId === proposal.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Отозвать
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно подтверждения отзыва */}
      <ConfirmDialog
        isOpen={showWithdrawConfirm}
        onClose={() => {
          setShowWithdrawConfirm(false)
          setProposalToWithdraw(null)
        }}
        onConfirm={handleWithdraw}
        title="Отозвать отклик?"
        message="Вы уверены, что хотите отозвать этот отклик? После отзыва вы не сможете откликнуться на эту заявку снова."
        confirmText="Отозвать"
        cancelText="Отмена"
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
    </div>
  )
}

