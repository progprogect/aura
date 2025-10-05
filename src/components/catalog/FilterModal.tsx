/**
 * Модальное окно фильтров
 * Версия 2.0 с улучшениями:
 * - Использует централизованные типы
 * - Lucide-react иконки
 * - Улучшенная accessibility
 * - useCategoryMap для категорий
 */

'use client'

import { useEffect, useRef } from 'react'
import { Icon } from '@/components/ui/icons/Icon'
import { X } from '@/components/ui/icons/catalog-icons'
import { useCategoryMap } from '@/hooks/useCategories'
import { FilterState } from '@/lib/catalog/types'
import {
  EXPERIENCE_OPTIONS,
  FORMAT_OPTIONS,
  SORT_OPTIONS,
} from '@/lib/catalog/constants'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  onReset: () => void
}

export function FilterModal({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
}: FilterModalProps) {
  const { categories, loading } = useCategoryMap()
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Focus management при открытии/закрытии
  useEffect(() => {
    if (isOpen) {
      // Сохраняем предыдущий фокус
      previousFocusRef.current = document.activeElement as HTMLElement

      // Фокусируемся на модалке
      setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
    } else {
      // Возвращаем фокус на предыдущий элемент
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

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
      : filters.format.filter((f) => f !== format)

    onFilterChange({ format: newFormats })
  }

  const handleVerifiedChange = (verified: boolean) => {
    onFilterChange({ verified })
  }

  const handleSortChange = (sortBy: string) => {
    onFilterChange({ sortBy })
  }

  const handleApply = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          role="document"
          tabIndex={-1}
        >
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3
                id="filter-modal-title"
                className="text-lg font-medium text-gray-900"
              >
                Все фильтры
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Закрыть модальное окно"
              >
                <Icon icon={X} size={24} aria-hidden />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pb-4 sm:p-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Специализация */}
              <fieldset>
                <legend className="text-sm font-medium text-gray-900 mb-3">
                  Специализация:
                </legend>
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-sm text-gray-500">Загрузка...</div>
                  ) : (
                    <>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value="all"
                          checked={filters.category === 'all'}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Все специалисты
                        </span>
                      </label>

                      {Array.from(categories.values()).map((category) => (
                        <label
                          key={category.key}
                          className="flex items-center cursor-pointer"
                        >
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
              </fieldset>

              {/* Опыт работы */}
              <fieldset>
                <legend className="text-sm font-medium text-gray-900 mb-3">
                  Опыт работы:
                </legend>
                <div className="space-y-2">
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="experience"
                        value={option.value}
                        checked={filters.experience === option.value}
                        onChange={(e) => handleExperienceChange(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Формат работы */}
              <fieldset>
                <legend className="text-sm font-medium text-gray-900 mb-3">
                  Формат работы:
                </legend>
                <div className="space-y-2">
                  {FORMAT_OPTIONS.map((format) => (
                    <label
                      key={format.value}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.format.includes(format.value)}
                        onChange={(e) =>
                          handleFormatChange(format.value, e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {format.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Верификация */}
              <fieldset>
                <legend className="text-sm font-medium text-gray-900 mb-3">
                  Верификация:
                </legend>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => handleVerifiedChange(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Только верифицированные
                  </span>
                </label>
              </fieldset>

              {/* Сортировка */}
              <fieldset>
                <legend className="text-sm font-medium text-gray-900 mb-3">
                  Сортировка:
                </legend>
                <div className="space-y-2">
                  {SORT_OPTIONS.map((sort) => (
                    <label
                      key={sort.value}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="sort"
                        value={sort.value}
                        checked={filters.sortBy === sort.value}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {sort.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <button
              onClick={handleApply}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-colors"
            >
              Применить
            </button>
            <button
              onClick={onReset}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
