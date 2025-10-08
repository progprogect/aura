/**
 * Универсальный редактор кастомных полей специализации
 * Динамически рендерит нужный компонент в зависимости от типа поля
 */

'use client'

import { InlineInput } from './InlineInput'
import { InlineTextarea } from './InlineTextarea'
import { InlineTagsEditor } from './InlineTagsEditor'
import type { CategoryField } from '@/lib/category-config'

interface CustomFieldsEditorProps {
  customFields: Record<string, any>
  categoryFields: Record<string, CategoryField>
  isEditMode: boolean
  onSave: (key: string, value: any) => Promise<void>
}

export function CustomFieldsEditor({
  customFields,
  categoryFields,
  isEditMode,
  onSave
}: CustomFieldsEditorProps) {
  // Если нет полей для редактирования
  if (!categoryFields || Object.keys(categoryFields).length === 0) {
    return null
  }

  // Рендерим каждое поле в зависимости от типа
  return (
    <div className="space-y-6">
      {Object.entries(categoryFields).map(([key, fieldConfig]) => {
        const currentValue = customFields?.[key]
        
        return (
          <div key={key}>
            {/* ARRAY - используем InlineTagsEditor */}
            {fieldConfig.type === 'array' && (
              <InlineTagsEditor
                values={Array.isArray(currentValue) ? currentValue : []}
                field={key}
                onSave={async (field, values) => {
                  await onSave(field, values)
                }}
                isEditMode={isEditMode}
                placeholder={fieldConfig.placeholder || `Добавить ${fieldConfig.label.toLowerCase()}...`}
                maxTags={10}
                label={`${fieldConfig.icon} ${fieldConfig.label}`}
              />
            )}

            {/* STRING - используем InlineInput или InlineTextarea */}
            {fieldConfig.type === 'string' && (
              <>
                {/* Если длинное поле - textarea, иначе input */}
                {fieldConfig.placeholder && fieldConfig.placeholder.length > 50 ? (
                  <InlineTextarea
                    value={typeof currentValue === 'string' ? currentValue : ''}
                    field={key}
                    onSave={onSave}
                    isEditMode={isEditMode}
                    placeholder={fieldConfig.placeholder || ''}
                    minRows={3}
                    label={`${fieldConfig.icon} ${fieldConfig.label}`}
                  />
                ) : (
                  <InlineInput
                    value={typeof currentValue === 'string' ? currentValue : ''}
                    field={key}
                    onSave={onSave}
                    isEditMode={isEditMode}
                    placeholder={fieldConfig.placeholder || ''}
                    label={`${fieldConfig.icon} ${fieldConfig.label}`}
                  />
                )}
              </>
            )}

            {/* NUMBER - используем InlineInput type="number" */}
            {fieldConfig.type === 'number' && (
              <InlineInput
                value={typeof currentValue === 'number' ? currentValue : null}
                field={key}
                onSave={onSave}
                isEditMode={isEditMode}
                type="number"
                placeholder={fieldConfig.placeholder || '0'}
                label={`${fieldConfig.icon} ${fieldConfig.label}`}
              />
            )}

            {/* BOOLEAN - checkbox/toggle */}
            {fieldConfig.type === 'boolean' && isEditMode && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentValue === true}
                    onChange={(e) => onSave(key, e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {fieldConfig.icon} {fieldConfig.label}
                  </span>
                </label>
                {fieldConfig.helpText && (
                  <span className="text-xs text-gray-500">
                    {fieldConfig.helpText}
                  </span>
                )}
              </div>
            )}

            {/* Режим просмотра для boolean */}
            {fieldConfig.type === 'boolean' && !isEditMode && currentValue !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {fieldConfig.icon} {fieldConfig.label}:
                </span>
                <span className={`text-sm ${currentValue ? 'text-green-600' : 'text-gray-400'}`}>
                  {currentValue ? 'Да' : 'Нет'}
                </span>
              </div>
            )}

            {/* Подсказка (helpText) */}
            {isEditMode && fieldConfig.helpText && fieldConfig.type !== 'boolean' && (
              <p className="text-xs text-gray-500 mt-1">
                {fieldConfig.helpText}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

