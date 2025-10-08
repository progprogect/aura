/**
 * Селектор категории специалиста
 */

'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

interface CategoryOption {
  value: string
  label: string
  emoji: string
}

const CATEGORIES: CategoryOption[] = [
  { value: 'psychology', label: 'Психология и терапия', emoji: '🧠' },
  { value: 'fitness', label: 'Фитнес и спорт', emoji: '🏋️' },
  { value: 'nutrition', label: 'Питание и диетология', emoji: '🥗' },
  { value: 'massage', label: 'Массаж и телесные практики', emoji: '💆' },
  { value: 'wellness', label: 'Wellness и холистические практики', emoji: '🧘' },
  { value: 'coaching', label: 'Коучинг и наставничество', emoji: '🎯' },
  { value: 'medicine', label: 'Медицинские специалисты', emoji: '⚕️' },
  { value: 'other', label: 'Другие специалисты', emoji: '✨' },
]

interface CategorySelectorProps {
  value: string
  onSave: (field: string, value: string) => Promise<any>
  label?: string
}

export function CategorySelector({ value, onSave, label = 'Категория' }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const selectedCategory = CATEGORIES.find(cat => cat.value === value) || CATEGORIES[CATEGORIES.length - 1]

  const handleSelect = async (categoryValue: string) => {
    if (categoryValue === value) {
      setIsOpen(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave('category', categoryValue)
      setIsOpen(false)
    } catch (error) {
      console.error('Ошибка сохранения категории:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSaving}
          className="
            w-full px-4 py-3
            bg-white border border-gray-300 rounded-lg
            text-left
            flex items-center justify-between
            hover:border-blue-400 hover:bg-blue-50
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedCategory.emoji}</span>
            <span className="text-sm font-medium text-gray-900">
              {selectedCategory.label}
            </span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="
              absolute z-20 mt-2 w-full
              bg-white border border-gray-200 rounded-lg shadow-lg
              max-h-80 overflow-y-auto
              animate-in fade-in slide-in-from-top-2 duration-200
            ">
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleSelect(category.value)}
                  disabled={isSaving}
                  className={`
                    w-full px-4 py-3
                    flex items-center justify-between
                    text-left
                    hover:bg-blue-50
                    transition-colors duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${category.value === value ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.emoji}</span>
                    <span className={`text-sm font-medium ${
                      category.value === value ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {category.label}
                    </span>
                  </div>
                  {category.value === value && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {isSaving && (
        <p className="text-xs text-blue-600 flex items-center gap-2">
          <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Сохранение...
        </p>
      )}
    </div>
  )
}

