/**
 * Inline редактор для тегов (специализаций, форматов работы)
 */

'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { X, Plus, Check, Loader2 } from 'lucide-react'

interface InlineTagsEditorProps {
  values: string[]
  field: string
  onSave: (field: string, values: string[]) => Promise<void>
  isEditMode: boolean
  placeholder?: string
  maxTags?: number
  label?: string
}

export function InlineTagsEditor({
  values,
  field,
  onSave,
  isEditMode,
  placeholder = 'Добавить...',
  maxTags = 5,
  label
}: InlineTagsEditorProps) {
  const [localValues, setLocalValues] = useState(values)
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleAdd = async () => {
    const trimmed = newTag.trim()
    if (!trimmed || localValues.includes(trimmed) || localValues.length >= maxTags) {
      return
    }

    const newValues = [...localValues, trimmed]
    setLocalValues(newValues)
    setNewTag('')
    await saveChanges(newValues)
  }

  const handleRemove = async (tag: string) => {
    if (localValues.length === 1) {
      // Минимум 1 тег должен остаться
      return
    }

    const newValues = localValues.filter(t => t !== tag)
    setLocalValues(newValues)
    await saveChanges(newValues)
  }

  const saveChanges = async (newValues: string[]) => {
    setIsSaving(true)
    setIsSaved(false)

    try {
      await onSave(field, newValues)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      // Откатываем
      setLocalValues(values)
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  if (!isEditMode) {
    // Режим просмотра
    return (
      <div className="flex flex-wrap gap-2">
        {values.map((tag, index) => (
          <Badge key={index} variant="default">
            {tag}
          </Badge>
        ))}
      </div>
    )
  }

  // Режим редактирования
  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
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

      {/* Существующие теги */}
      <div className="flex flex-wrap gap-2">
        {localValues.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="px-3 py-1.5 text-sm flex items-center gap-2"
          >
            {tag}
            {localValues.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="hover:text-red-500 transition-colors"
                aria-label={`Удалить ${tag}`}
              >
                <X size={14} />
              </button>
            )}
          </Badge>
        ))}
      </div>

      {/* Добавление нового тега */}
      {localValues.length < maxTags && (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={placeholder}
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            className="h-10 text-sm flex-1 border-2 border-blue-300"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newTag.trim() || isSaving}
            className="
              px-4 h-10 rounded-md bg-blue-600 text-white font-medium text-sm
              hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors flex items-center gap-2
            "
          >
            <Plus size={16} />
            Добавить
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500">
        {localValues.length}/{maxTags} тегов
      </p>
    </div>
  )
}

