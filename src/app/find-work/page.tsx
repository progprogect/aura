/**
 * Публичная страница поиска заявок для специалистов
 */

'use client'

import { useState, useEffect } from 'react'
import { PublicRequestCard } from '@/components/requests/PublicRequestCard'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Loader2, AlertCircle, ChevronDown, Search } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { ProposalForm } from '@/components/requests/ProposalForm'
import { Dialog } from '@/components/ui/dialog'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { BreadcrumbItem } from '@/lib/navigation/types'

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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    )
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Главная', href: '/' },
    { label: 'Найти клиента', isActive: true },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs навигация */}
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Найти клиента
          </h1>
          <p className="text-gray-600">
            Просмотрите заявки пользователей и откликнитесь на подходящие
          </p>
        </div>
        
        {/* Поисковая строка */}
        <div className="relative mb-6">
          <div className="relative">
            <button
              type="button"
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="Выполнить поиск"
            >
              <Search className="h-5 w-5" />
            </button>
            <input
              type="text"
              placeholder="Поиск по заголовку и описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 transition-all duration-200 shadow-sm border-gray-300 hover:shadow-md focus:shadow-md focus:border-gray-400"
              aria-label="Поиск заявок по заголовку и описанию"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
                aria-label="Очистить поиск"
              >
                <span className="text-lg">×</span>
              </button>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500" role="status" aria-live="polite">
            {searchQuery ? (
              <span>Поиск по заголовку и описанию</span>
            ) : (
              <span>Введите запрос для поиска</span>
            )}
          </div>
        </div>

        {/* Панель фильтров */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6">
          <Popover open={isCategoryFilterOpen} onOpenChange={setIsCategoryFilterOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all min-h-[44px] whitespace-nowrap"
              >
                <span className="font-medium text-sm sm:text-base">{currentCategoryLabel}</span>
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
                    'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors',
                    categoryFilter === 'all' && 'bg-gray-100 font-medium'
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
                      'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2',
                      categoryFilter === category.key && 'bg-gray-100 font-medium'
                    )}
                  >
                    <span>{category.emoji}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Счётчик результатов */}
          <div className="text-sm sm:text-base text-gray-600 text-center sm:text-right" role="status" aria-live="polite">
            {requests.length === 0 ? (
              <span>Заявки не найдены</span>
            ) : (
              <span>Найдено {requests.length} {requests.length === 1 ? 'заявка' : requests.length < 5 ? 'заявки' : 'заявок'}</span>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Список заявок */}
        {requests.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4 flex items-center justify-center">
              <div className="text-6xl text-gray-300">📋</div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Заявки не найдены
            </h3>
            <p className="text-gray-500">
              {searchQuery || categoryFilter !== 'all'
                ? 'Попробуйте изменить параметры поиска или фильтры'
                : 'Пока нет открытых заявок'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

