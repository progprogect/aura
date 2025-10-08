/**
 * Inline редактируемое текстовое поле (textarea)
 * С auto-save и debounce
 */

'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Edit2, Check, Loader2 } from 'lucide-react'
import { debounce } from '@/lib/utils/debounce'

interface InlineTextareaProps {
  value: string
  field: string
  onSave: (field: string, value: string) => Promise<void>
  isEditMode: boolean
  placeholder?: string
  minRows?: number
  maxLength?: number
  label?: string
}

export function InlineTextarea({
  value,
  field,
  onSave,
  isEditMode,
  placeholder = 'Начните вводить...',
  minRows = 3,
  maxLength,
  label
}: InlineTextareaProps) {
  const [localValue, setLocalValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Обновляем локальное значение при изменении prop
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounced сохранение
  const debouncedSave = useMemo(
    () =>
      debounce(async (newValue: string) => {
        if (newValue === value) return

        setIsSaving(true)
        setIsSaved(false)

        try {
          await onSave(field, newValue)
          setIsSaved(true)
          setTimeout(() => setIsSaved(false), 2000)
        } catch (error) {
          console.error('Ошибка сохранения:', error)
          // Откатываем значение
          setLocalValue(value)
        } finally {
          setIsSaving(false)
        }
      }, 500),
    [field, onSave, value]
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    debouncedSave(newValue)
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [localValue])

  if (!isEditMode) {
    // Режим просмотра
    return (
      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
        {value || <span className="text-gray-400 italic">{placeholder}</span>}
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
            {maxLength && (
              <span className={localValue.length > maxLength ? 'text-red-500' : 'text-gray-400'}>
                {localValue.length}/{maxLength}
              </span>
            )}
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
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          rows={minRows}
          maxLength={maxLength}
          className="
            w-full px-4 py-3 
            border-2 border-blue-300 rounded-lg
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200
            outline-none resize-none
            transition-all duration-200
            text-gray-900 placeholder-gray-400
          "
        />
        
        {/* Иконка редактирования */}
        <div className="absolute top-3 right-3 opacity-50">
          <Edit2 size={16} className="text-gray-400" />
        </div>
      </div>
    </div>
  )
}

