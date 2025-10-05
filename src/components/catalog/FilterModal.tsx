'use client'

import { useState, useEffect } from 'react'
import { FilterState } from './CatalogContent'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  onReset: () => void
}

interface Category {
  key: string
  name: string
  emoji: string
  isActive: boolean
  order: number
}

export function FilterModal({ 
  isOpen, 
  onClose, 
  filters, 
  onFilterChange, 
  onReset 
}: FilterModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // Загрузка категорий
  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (response.ok) {
        setCategories(data.categories.sort((a: Category, b: Category) => a.order - b.order))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Обработчики изменения фильтров
  const handleCategoryChange = (category: string) => {
    onFilterChange({ category })
  }
  
  const handleExperienceChange = (experience: string) => {
    onFilterChange({ experience })
  }
  
  const handleFormatChange = (format: string, checked: boolean) => {
    const newFormats = checked
      ? [...filters.format, format]
      : filters.format.filter(f => f !== format)
    
    onFilterChange({ format: newFormats })
  }
  
  const handleVerifiedChange = (verified: boolean) => {
    onFilterChange({ verified })
  }
  
  const handleSortChange = (sortBy: string) => {
    onFilterChange({ sortBy })
  }
  
  // Применение фильтров и закрытие модального окна
  const handleApply = () => {
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Все фильтры
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-white px-4 pb-4 sm:p-6">
            <div className="space-y-6">
              {/* Специализация */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Специализация:
                </h4>
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-sm text-gray-500">Загрузка...</div>
                  ) : (
                    <>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value="all"
                          checked={filters.category === 'all'}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Все специалисты</span>
                      </label>
                      
                      {categories.map((category) => (
                        <label key={category.key} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value={category.key}
                            checked={filters.category === category.key}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {category.emoji} {category.name}
                          </span>
                        </label>
                      ))}
                    </>
                  )}
                </div>
              </div>
              
              {/* Опыт работы */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Опыт работы:
                </h4>
                <div className="space-y-2">
                  {[
                    { value: 'any', label: 'Любой опыт' },
                    { value: '0-2', label: 'До 2 лет' },
                    { value: '2-5', label: '2-5 лет' },
                    { value: '5+', label: '5+ лет' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="experience"
                        value={option.value}
                        checked={filters.experience === option.value}
                        onChange={(e) => handleExperienceChange(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Формат работы */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Формат работы:
                </h4>
                <div className="space-y-2">
                  {[
                    { value: 'online', label: 'Онлайн консультации' },
                    { value: 'offline', label: 'Очные встречи' },
                    { value: 'hybrid', label: 'Гибридный формат' },
                  ].map((format) => (
                    <label key={format.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.format.includes(format.value)}
                        onChange={(e) => handleFormatChange(format.value, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{format.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Верификация */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Верификация:
                </h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => handleVerifiedChange(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Только верифицированные</span>
                </label>
              </div>
              
              {/* Сортировка */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Сортировка:
                </h4>
                <div className="space-y-2">
                  {[
                    { value: 'relevance', label: 'По релевантности' },
                    { value: 'rating', label: 'По рейтингу' },
                    { value: 'experience', label: 'По опыту' },
                    { value: 'price', label: 'По цене' },
                  ].map((sort) => (
                    <label key={sort.value} className="flex items-center">
                      <input
                        type="radio"
                        name="sort"
                        value={sort.value}
                        checked={filters.sortBy === sort.value}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{sort.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleApply}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Применить
            </button>
            <button
              onClick={onReset}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
