/**
 * Кнопка сортировки с dropdown меню
 * Стилизована консистентно с FilterButton
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Icon } from '@/components/ui/icons/Icon'
import { ChevronDown } from '@/components/ui/icons/catalog-icons'
import { SORT_OPTIONS } from '@/lib/catalog/constants'

interface SortButtonProps {
  value: string
  onChange: (value: string) => void
  compact?: boolean
}

/**
 * Компонент сортировки с кастомным dropdown
 * 
 * Features:
 * - Визуально консистентен с FilterButton
 * - Кастомный dropdown (контроль над стилями)
 * - Закрытие по клику вне / Escape
 * - Accessibility support
 * - Keyboard navigation
 */
export function SortButton({ value, onChange, compact = false }: SortButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Получаем текущий label
  const currentOption = SORT_OPTIONS.find((opt) => opt.value === value)
  const currentLabel = currentOption?.label || 'Сортировка'

  // Закрытие при клике вне dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleSelect = (newValue: string) => {
    onChange(newValue)
    setIsOpen(false)
    buttonRef.current?.focus()
  }

  return (
    <div className="relative">
      {/* Кнопка (стилизована как FilterButton) */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300
          bg-white text-gray-700 hover:bg-gray-50
          transition-all duration-200
          text-sm font-medium
          ${compact ? 'flex-1' : ''}
        `}
        aria-label={`Сортировка: ${currentLabel}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Текущий выбор */}
        <span>{currentLabel}</span>

        {/* Стрелка */}
        <Icon
          icon={ChevronDown}
          size={16}
          className={`flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      {/* Dropdown меню */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="
            absolute right-0 mt-2 w-56
            bg-white rounded-lg border border-gray-200 shadow-lg
            py-1 z-50
            animate-in fade-in slide-in-from-top-2 duration-200
          "
          role="listbox"
          aria-label="Опции сортировки"
        >
          {SORT_OPTIONS.map((option) => {
            const isSelected = value === option.value

            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm
                  transition-colors duration-150
                  ${
                    isSelected
                      ? 'text-blue-600 bg-blue-50 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
                role="option"
                aria-selected={isSelected}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

