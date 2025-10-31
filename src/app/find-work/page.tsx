/**
 * Публичная страница поиска заявок для специалистов
 */

'use client'

import { useState, useEffect } from 'react'
import { PublicRequestCard } from '@/components/requests/PublicRequestCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Loader2, AlertCircle, ChevronDown, Search } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { ProposalForm } from '@/components/requests/ProposalForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Request {
  id: string
  title: string
  description: string
  category: string
  budget: number | null
  status: string
  createdAt: string
  proposals: Array<{ id: string; status: string }>
  user: {
    id: string
    firstName: string
    lastName: string
    avatar: string | null
  }
  canRespond?: boolean
  _count?: {
    proposals: number
  }
}

interface Category {
  key: string
  name: string
  emoji: string
}

export default function FindWorkPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [specialistCategory, setSpecialistCategory] = useState<string | null>(null)

  // Загрузка категорий
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setCategories(data.categories.filter((c: Category) => c.isActive))
        }
      })
  }, [])

  // Проверка категории специалиста
  useEffect(() => {
    // Проверяем авторизацию и получаем категорию специалиста
    fetch('/api/auth/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.profile?.category) {
          setSpecialistCategory(data.profile.category)
        }
      })
      .catch(() => {})
  }, [])

  // Загрузка заявок
  useEffect(() => {
    setLoading(true)
    setError('')

    fetch('/api/requests?public=true')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          let filteredRequests = data.requests || []

          // Фильтр по категории
          if (categoryFilter !== 'all') {
            filteredRequests = filteredRequests.filter(
              (r: Request) => r.category === categoryFilter
            )
          }

          // Фильтр по поисковому запросу
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filteredRequests = filteredRequests.filter(
              (r: Request) =>
                r.title.toLowerCase().includes(query) ||
                r.description.toLowerCase().includes(query)
            )
          }

          // Устанавливаем canRespond для каждой заявки
          filteredRequests = filteredRequests.map((r: Request) => ({
            ...r,
            canRespond: specialistCategory === r.category && r.status === 'open'
          }))

          setRequests(filteredRequests)
        } else {
          setError(data.error || 'Ошибка при загрузке заявок')
        }
      })
      .catch(() => {
        setError('Произошла ошибка при загрузке заявок')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [categoryFilter, searchQuery, specialistCategory])

  const handleRespond = (request: Request) => {
    setSelectedRequest(request)
    setShowProposalModal(true)
  }

  const currentCategoryLabel = categoryFilter === 'all' 
    ? 'Все категории'
    : categories.find(c => c.key === categoryFilter)?.name || 'Все категории'

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Найти клиента</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Просмотрите заявки пользователей и откликнитесь на подходящие
          </p>
        </div>

        {/* Фильтры */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по заголовку и описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Popover open={isCategoryFilterOpen} onOpenChange={setIsCategoryFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[200px] justify-between">
                {currentCategoryLabel}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <div className="py-1">
                <button
                  onClick={() => {
                    setCategoryFilter('all')
                    setIsCategoryFilterOpen(false)
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors',
                    categoryFilter === 'all' && 'bg-muted font-medium'
                  )}
                >
                  Все категории
                </button>
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => {
                      setCategoryFilter(category.key)
                      setIsCategoryFilterOpen(false)
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2',
                      categoryFilter === category.key && 'bg-muted font-medium'
                    )}
                  >
                    <span>{category.emoji}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Список заявок */}
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || categoryFilter !== 'all'
                ? 'Не найдено заявок по вашим фильтрам'
                : 'Пока нет открытых заявок'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {requests.map((request) => {
              const category = categories.find(c => c.key === request.category)
              const proposalsCount = request._count?.proposals || request.proposals?.length || 0

              return (
                <PublicRequestCard
                  key={request.id}
                  {...request}
                  proposalsCount={proposalsCount}
                  categoryEmoji={category?.emoji}
                  categoryName={category?.name}
                  onRespond={() => handleRespond(request)}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Модальное окно для создания отклика */}
      {selectedRequest && (
        <Dialog
          isOpen={showProposalModal}
          onClose={() => {
            setShowProposalModal(false)
            setSelectedRequest(null)
          }}
          title="Отклик на заявку"
        >
          <ProposalForm
            requestId={selectedRequest.id}
            requestBudget={selectedRequest.budget}
            onSuccess={() => {
              setShowProposalModal(false)
              setSelectedRequest(null)
              // Перезагружаем список заявок
              window.location.reload()
            }}
            onCancel={() => {
              setShowProposalModal(false)
              setSelectedRequest(null)
            }}
          />
        </Dialog>
      )}
    </div>
  )
}

