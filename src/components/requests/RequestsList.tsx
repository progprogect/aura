/**
 * Список заявок пользователя
 */

'use client'

import { useState, useEffect } from 'react'
import { RequestCard } from './RequestCard'
import { RequestQuiz } from './RequestQuiz'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Loader2, AlertCircle, ChevronDown, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Request {
  id: string
  title: string
  description: string
  category: string
  budget: number | null
  status: string
  createdAt: string
  proposals: Array<{ id: string; status: string }>
  _count?: {
    proposals: number
  }
}

interface Category {
  key: string
  name: string
  emoji: string
}

export function RequestsList() {
  const [requests, setRequests] = useState<Request[]>([])
  const [categories, setCategories] = useState<Record<string, Category>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showRequestQuiz, setShowRequestQuiz] = useState(false)

  const statusOptions = [
    { value: 'all', label: 'Все статусы' },
    { value: 'open', label: 'Открытые' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'completed', label: 'Завершённые' },
    { value: 'cancelled', label: 'Отменённые' },
  ]

  const currentStatusLabel = statusOptions.find(opt => opt.value === statusFilter)?.label || 'Все статусы'

  // Загрузка категорий
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          const catMap: Record<string, Category> = {}
          data.categories.forEach((cat: Category) => {
            catMap[cat.key] = cat
          })
          setCategories(catMap)
        }
      })
      .catch(() => {})
  }, [])

  // Функция загрузки заявок (вынесена для возможности перезагрузки)
  const fetchRequests = () => {
    setLoading(true)
    setError('')

    const url = statusFilter === 'all' 
      ? '/api/requests'
      : `/api/requests?status=${statusFilter}`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRequests(data.requests || [])
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
  }

  // Загрузка заявок
  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

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

  if (requests.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">У вас пока нет заявок</p>
          <Button onClick={() => setShowRequestQuiz(true)}>
            Создать заявку
          </Button>
        </div>

        {/* Модальное окно Quiz */}
        <AnimatePresence>
          {showRequestQuiz && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setShowRequestQuiz(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{
                  type: 'spring',
                  damping: 30,
                  stiffness: 300,
                }}
                className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center pointer-events-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full md:w-auto md:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[90vh] md:max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl md:rounded-2xl shadow-2xl pointer-events-auto safe-area-inset-bottom md:safe-area-inset-bottom-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm touch-manipulation min-h-[44px] min-w-[44px]"
                    onClick={() => setShowRequestQuiz(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <RequestQuiz
                    onClose={() => {
                      setShowRequestQuiz(false)
                      // Перезагружаем список заявок после создания
                      fetchRequests()
                    }}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Заголовок и фильтр */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold">Мои заявки</h2>
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[180px] justify-between">
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

        {/* Список заявок */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {requests.map((request) => {
            const category = categories[request.category]
            const proposalsCount = request._count?.proposals || request.proposals?.length || 0

            return (
              <RequestCard
                key={request.id}
                id={request.id}
                title={request.title}
                category={request.category}
                budget={request.budget}
                proposalsCount={proposalsCount}
                status={request.status}
                createdAt={request.createdAt}
                categoryEmoji={category?.emoji}
                categoryName={category?.name}
              />
            )
          })}
        </div>

        {/* Кнопка создания заявки (когда есть заявки) */}
        <div className="flex justify-end pt-4">
          <Button onClick={() => setShowRequestQuiz(true)}>
            Создать заявку
          </Button>
        </div>
      </div>

      {/* Модальное окно Quiz */}
      <AnimatePresence>
        {showRequestQuiz && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowRequestQuiz(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full md:w-auto md:max-w-3xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto bg-white rounded-t-2xl md:rounded-2xl shadow-2xl pointer-events-auto safe-area-inset-bottom md:safe-area-inset-bottom-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm touch-manipulation min-h-[44px] min-w-[44px]"
                  onClick={() => setShowRequestQuiz(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <RequestQuiz
                  onClose={() => {
                    setShowRequestQuiz(false)
                    // Перезагружаем список заявок после создания
                    setStatusFilter('all')
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

