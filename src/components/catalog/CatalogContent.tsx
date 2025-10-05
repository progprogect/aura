'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { SearchBar } from './SearchBar'
import { FilterButton } from './FilterButton'
import { FilterModal } from './FilterModal'
import { SpecialistGrid } from './SpecialistGrid'
import { LoadingSpinner } from './LoadingSpinner'
import { useToast, ToastContainer } from '@/components/ui/toast'

export interface Specialist {
  id: string
  firstName: string
  lastName: string
  fullName: string
  avatar: string | null
  slug: string
  category: string
  specializations: string[]
  tagline: string | null
  about: string
  shortAbout: string
  city: string | null
  country: string
  workFormats: string[]
  yearsOfPractice: number | null
  priceFrom: number | null
  priceTo: number | null
  currency: string
  priceDescription: string | null
  verified: boolean
  profileViews: number
  customFields: any
}

export interface FilterState {
  category: string
  experience: string
  format: string[]
  verified: boolean
  sortBy: string
  search: string
}

export interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export function CatalogContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  // Toast уведомления
  const { toasts, addToast, removeToast } = useToast()
  
  // Состояние фильтров
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || 'all',
    experience: searchParams.get('experience') || 'any',
    format: searchParams.get('format')?.split(',').filter(Boolean) || [],
    verified: searchParams.get('verified') === 'true',
    sortBy: searchParams.get('sortBy') || 'relevance',
    search: searchParams.get('search') || '',
  })
  
  // Состояние данных
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  
  // Debounced поиск
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // Функция для обновления URL
  const updateURL = useCallback((newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    const params = new URLSearchParams()
    
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== 'all' && value !== 'any' && value !== '' && 
          !(Array.isArray(value) && value.length === 0) && 
          !(key === 'verified' && !value)) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','))
        } else {
          params.set(key, String(value))
        }
      }
    })
    
    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newUrl)
  }, [filters, pathname, router])
  
  // Функция для загрузки специалистов
  const fetchSpecialists = useCallback(async (currentFilters: FilterState, page: number = 1) => {
    setLoading(true)
    
    try {
      const params = new URLSearchParams()
      
      // Добавляем параметры фильтрации
      if (currentFilters.category !== 'all') {
        params.set('category', currentFilters.category)
      }
      if (currentFilters.experience !== 'any') {
        params.set('experience', currentFilters.experience)
      }
      if (currentFilters.format.length > 0) {
        params.set('format', currentFilters.format.join(','))
      }
      if (currentFilters.verified) {
        params.set('verified', 'true')
      }
      if (currentFilters.sortBy !== 'relevance') {
        params.set('sortBy', currentFilters.sortBy)
      }
      if (currentFilters.search) {
        params.set('search', currentFilters.search)
      }
      
      params.set('page', String(page))
      params.set('limit', '12')
      
      const response = await fetch(`/api/specialists?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setSpecialists(data.specialists)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching specialists:', data.error)
        addToast({
          type: 'error',
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить список специалистов. Попробуйте обновить страницу.',
        })
      }
    } catch (error) {
      console.error('Error fetching specialists:', error)
      addToast({
        type: 'error',
        title: 'Ошибка соединения',
        description: 'Проверьте подключение к интернету и попробуйте снова.',
      })
    } finally {
      setLoading(false)
    }
  }, [addToast])
  
  // Обработчик изменения фильтров
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    updateURL(newFilters)
    fetchSpecialists(updatedFilters)
  }, [filters, updateURL, fetchSpecialists])
  
  // Обработчик поиска с debounce
  const handleSearchChange = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }))
    
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    const timeout = setTimeout(() => {
      const updatedFilters = { ...filters, search }
      updateURL({ search })
      fetchSpecialists(updatedFilters)
    }, 300)
    
    setSearchTimeout(timeout)
  }, [filters, searchTimeout, updateURL, fetchSpecialists])
  
  // Обработчик сброса фильтров
  const handleResetFilters = useCallback(() => {
    const resetFilters: FilterState = {
      category: 'all',
      experience: 'any',
      format: [],
      verified: false,
      sortBy: 'relevance',
      search: '',
    }
    
    setFilters(resetFilters)
    router.push(pathname)
    fetchSpecialists(resetFilters)
    setIsFilterModalOpen(false)
  }, [pathname, router, fetchSpecialists])
  
  // Загрузка данных при монтировании
  useEffect(() => {
    fetchSpecialists(filters)
  }, [fetchSpecialists, filters]) // Загружаем при монтировании и изменении фильтров
  
  // Отдельный эффект для отслеживания изменений фильтров через URL
  useEffect(() => {
    const urlFilters: FilterState = {
      category: searchParams.get('category') || 'all',
      experience: searchParams.get('experience') || 'any',
      format: searchParams.get('format')?.split(',').filter(Boolean) || [],
      verified: searchParams.get('verified') === 'true',
      sortBy: searchParams.get('sortBy') || 'relevance',
      search: searchParams.get('search') || '',
    }
    
    // Обновляем фильтры только если они изменились
    const filtersChanged = Object.keys(urlFilters).some(key => 
      urlFilters[key as keyof FilterState] !== filters[key as keyof FilterState]
    )
    
    if (filtersChanged) {
      setFilters(urlFilters)
      fetchSpecialists(urlFilters)
    }
  }, [searchParams, fetchSpecialists, filters])
  
  // Очистка timeout при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])
  
  return (
    <>
      {/* Toast уведомления */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Поисковая строка */}
      <SearchBar 
        value={filters.search}
        onChange={handleSearchChange}
      />
      
      {/* Панель фильтров */}
      <div className="flex items-center justify-between mb-6">
        <FilterButton 
          filters={filters}
          totalCount={pagination?.totalCount || 0}
          onClick={() => setIsFilterModalOpen(true)}
        />
        
        {/* Сортировка */}
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="relevance">По релевантности</option>
          <option value="rating">По рейтингу</option>
          <option value="experience">По опыту</option>
          <option value="price">По цене</option>
        </select>
      </div>
      
      {/* Сетка специалистов */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <SpecialistGrid 
          specialists={specialists}
          pagination={pagination}
          onLoadMore={(page) => fetchSpecialists(filters, page)}
        />
      )}
      
      {/* Модальное окно фильтров */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />
    </>
  )
}
