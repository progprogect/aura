/**
 * Модальное окно фильтров
 * Версия 3.0 - полностью стилизованная:
 * - Button-style radio опции
 * - Chip-style checkbox опции
 * - Toggle switch для verified
 * - Grid layout для категорий
 * - Scroll lock (не скроллит основную страницу)
 * - Консистентный дизайн
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/icons/Icon'
import { X } from '@/components/ui/icons/catalog-icons'
import { useCategoryMap } from '@/hooks/useCategories'
import { useScrollLock } from '@/hooks/useScrollLock'
import { FilterState } from '@/lib/catalog/types'
import { areFiltersEqual } from '@/lib/catalog/utils'
import {
  EXPERIENCE_OPTIONS,
  FORMAT_OPTIONS,
  SORT_OPTIONS,
} from '@/lib/catalog/constants'
import { FilterRadioButton } from './filters/FilterRadioButton'
import { FilterChip } from './filters/FilterChip'
import { FilterToggle } from './filters/FilterToggle'

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

  // Draft state - локальное состояние фильтров
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters)

  // Синхронизация draft с props при открытии
  useEffect(() => {
    if (isOpen) {
      console.log('🔵 FilterModal opened, syncing draft with filters:', filters)
      setDraftFilters(filters)
    }
  }, [isOpen, filters])

  // Проверка наличия несохранённых изменений
  const hasChanges = !areFiltersEqual(draftFilters, filters)

  // Применение фильтров
  const handleApply = useCallback(() => {
    onFilterChange(draftFilters)
    onClose()
  }, [draftFilters, onFilterChange, onClose])

  // Закрытие модалки (сбрасывает draft)
  const handleClose = useCallback(() => {
    setDraftFilters(filters) // Возвращаем к текущим фильтрам
    onClose()
  }, [filters, onClose])

  // Блокировка скролла основной страницы
  useScrollLock(isOpen)

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      setTimeout(() => modalRef.current?.focus(), 100)
    } else {
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (!isOpen) return

      // Escape - закрыть
      if (e.key === 'Escape') {
        handleClose()
      }

      // Enter - применить (если есть изменения)
      if (e.key === 'Enter' && hasChanges && !e.shiftKey) {
        e.preventDefault()
        handleApply()
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [isOpen, hasChanges, handleClose, handleApply])

  // Обработчики изменяют только draft (не применяют!)
  const handleCategoryChange = (category: string) => {
    setDraftFilters((prev) => ({ ...prev, category }))
  }

  const handleExperienceChange = (experience: string) => {
    setDraftFilters((prev) => ({ ...prev, experience }))
  }

  const handleFormatToggle = (format: string) => {
    setDraftFilters((prev) => {
      console.log('🔵 handleFormatToggle:', format)
      console.log('  prev.format:', prev.format)
      const isSelected = prev.format.includes(format)
      console.log('  isSelected:', isSelected)
      const newFormats = isSelected
        ? prev.format.filter((f) => f !== format)
        : [...prev.format, format]
      console.log('  newFormats:', newFormats)
      return { ...prev, format: newFormats }
    })
  }

  const handleVerifiedChange = (verified: boolean) => {
    setDraftFilters((prev) => ({ ...prev, verified }))
  }

  const handleSortChange = (sortBy: string) => {
    setDraftFilters((prev) => ({ ...prev, sortBy }))
  }

  // Сброс фильтров (только draft)
  const handleResetClick = () => {
    onReset() // Вызываем родительский reset для получения defaults
    // Draft обновится через useEffect при изменении filters
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
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-md transition-opacity duration-300"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className="
            inline-block align-bottom bg-white text-left overflow-hidden shadow-2xl transform transition-all
            sm:my-8 sm:align-middle sm:w-full sm:max-w-3xl lg:max-w-4xl sm:rounded-2xl
            max-sm:fixed max-sm:inset-0 max-sm:z-50 max-sm:w-full max-sm:h-full max-sm:rounded-none
          "
          role="document"
          tabIndex={-1}
        >
          {/* Header */}
          <div className="bg-white px-6 sm:px-8 pt-6 pb-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3
                id="filter-modal-title"
                className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-2"
              >
                <span>Все фильтры</span>
                {/* Показываем активную сортировку */}
                {draftFilters.sortBy !== 'relevance' && (
                  <span className="text-sm sm:text-base font-normal text-gray-600">
                    · {SORT_OPTIONS.find((opt) => opt.value === draftFilters.sortBy)?.label}
                  </span>
                )}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-2 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                aria-label="Закрыть модальное окно"
              >
                <Icon icon={X} size={24} aria-hidden />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 sm:px-8 py-6 max-h-[60vh] max-sm:max-h-none overflow-y-auto">
            <div className="space-y-8">
              {/* Специализация */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-900 tracking-wide uppercase mb-4">
                  Специализация
                </legend>
                {loading ? (
                  <div className="text-sm text-gray-500">Загрузка...</div>
                ) : (
                  <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]" role="radiogroup">
                    <FilterRadioButton
                      label="Все специалисты"
                      value="all"
                      checked={draftFilters.category === 'all'}
                      onChange={handleCategoryChange}
                    />

                    {Array.from(categories.values()).map((category) => (
                      <FilterRadioButton
                        key={category.key}
                        label={category.name}
                        value={category.key}
                        checked={draftFilters.category === category.key}
                        onChange={handleCategoryChange}
                      />
                    ))}
                  </div>
                )}
              </fieldset>

              {/* Опыт работы */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-900 tracking-wide uppercase mb-4">
                  Опыт работы
                </legend>
                <div className="space-y-3" role="radiogroup">
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <FilterRadioButton
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      checked={draftFilters.experience === option.value}
                      onChange={handleExperienceChange}
                    />
                  ))}
                </div>
              </fieldset>

              {/* Формат работы */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-900 tracking-wide uppercase mb-4 flex items-center justify-between">
                  <span>Формат работы</span>
                  {draftFilters.format.length > 0 && (
                    <span className="text-xs font-medium text-gray-600 normal-case tracking-normal">
                      {draftFilters.format.length} выбрано
                    </span>
                  )}
                </legend>
                <div className="flex flex-wrap gap-3" role="group">
                  {FORMAT_OPTIONS.map((format) => (
                    <FilterChip
                      key={format.value}
                      label={format.label}
                      selected={draftFilters.format.includes(format.value)}
                      onToggle={() => handleFormatToggle(format.value)}
                    />
                  ))}
                </div>
              </fieldset>

              {/* Верификация */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-900 tracking-wide uppercase mb-4">
                  Верификация
                </legend>
                <FilterToggle
                  label="Только верифицированные"
                  checked={draftFilters.verified}
                  onChange={handleVerifiedChange}
                  description="Показывать специалистов с подтверждённым образованием"
                />
              </fieldset>

              {/* Сортировка */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-900 tracking-wide uppercase mb-4">
                  Сортировка
                </legend>
                <div className="space-y-3" role="radiogroup">
                  {SORT_OPTIONS.map((sort) => (
                    <FilterRadioButton
                      key={sort.value}
                      label={sort.label}
                      value={sort.value}
                      checked={draftFilters.sortBy === sort.value}
                      onChange={handleSortChange}
                    />
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          {/* Footer - Sticky */}
          <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-6 sm:px-8 py-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={handleResetClick}
              className="
                w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300
                bg-white text-gray-700 font-medium text-sm sm:text-base
                hover:bg-gray-50 hover:border-gray-400
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2
                active:scale-[0.98]
                transition-all duration-200 ease-out
              "
            >
              Сбросить
            </button>
            <button
              onClick={handleApply}
              className="
                w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-sm sm:text-base
                bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2
                active:scale-[0.98]
                transition-all duration-200 ease-out
              "
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
