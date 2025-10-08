/**
 * Inline редактируемое текстовое поле (input)
 * Для коротких полей (имя, город, email и т.д.)
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Edit2, Check, Loader2 } from 'lucide-react'
import { debounce } from '@/lib/utils/debounce'

interface InlineInputProps {
  value: string | number | null
  field: string
  onSave: (field: string, value: string | number) => Promise<void>
  isEditMode: boolean
  placeholder?: string
  type?: 'text' | 'email' | 'url' | 'number'
  maxLength?: number
  label?: string
  prefix?: string
}

export function InlineInput({
  value,
  field,
  onSave,
  isEditMode,
  placeholder = 'Не указано',
  type = 'text',
  maxLength,
  label,
  prefix
}: InlineInputProps) {
  const [localValue, setLocalValue] = useState(value?.toString() || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Обновляем локальное значение при изменении prop
  useEffect(() => {
    setLocalValue(value?.toString() || '')
  }, [value])

  // Debounced сохранение
  const debouncedSave = useMemo(
    () =>
      debounce(async (newValue: string) => {
        const currentValue = value?.toString() || ''
        if (newValue === currentValue) return

        setIsSaving(true)
        setIsSaved(false)

        try {
          const processedValue = type === 'number' && newValue 
            ? parseInt(newValue, 10) 
            : newValue

          await onSave(field, processedValue)
          setIsSaved(true)
          setTimeout(() => setIsSaved(false), 2000)
        } catch (error) {
          console.error('Ошибка сохранения:', error)
          // Откатываем значение
          setLocalValue(currentValue)
        } finally {
          setIsSaving(false)
        }
      }, 500),
    [field, onSave, value, type]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    debouncedSave(newValue)
  }

  if (!isEditMode) {
    // Режим просмотра
    const displayValue = value?.toString() || ''
    
    return (
      <div className="text-gray-700">
        {displayValue ? (
          <>
            {prefix && <span className="text-gray-500">{prefix}</span>}
            {displayValue}
          </>
        ) : (
          <span className="text-gray-400 italic">{placeholder}</span>
        )}
      </div>
    )
  }

  // Режим редактирования
  return (
    <div className="relative group">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <div className="flex items-center gap-2 text-xs">
            {isSaving && (
              <span className="text-blue-600 flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" />
                Сохранение...
              </span>
            )}
            {isSaved && (
              <span className="text-green-600 flex items-center gap-1">
                <Check size={12} />
                Сохранено
              </span>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            {prefix}
          </span>
        )}
        
        <input
          type={type}
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`
            w-full px-4 py-2.5
            ${prefix ? 'pl-8' : ''}
            border-2 border-blue-300 rounded-lg
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200
            outline-none
            transition-all duration-200
            text-gray-900 placeholder-gray-400
            h-11
          `}
        />
        
        {/* Иконка редактирования */}
        <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-50">
          <Edit2 size={14} className="text-gray-400" />
        </div>
      </div>
    </div>
  )
}

