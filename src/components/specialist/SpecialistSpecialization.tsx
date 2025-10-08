'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import { SESSION_FORMAT_LABELS } from '@/lib/constants'
import { CustomFieldsEditor } from './edit/CustomFieldsEditor'
import type { CategoryConfig } from '@/lib/category-config'

export interface SpecialistSpecializationProps {
  category: string
  customFields?: any
  categoryConfig: CategoryConfig // Теперь передаем из server component
  isEditMode?: boolean
  onSaveCustomField?: (key: string, value: any) => Promise<void>
}

export function SpecialistSpecialization({
  category,
  customFields,
  categoryConfig,
  isEditMode = false,
  onSaveCustomField,
}: SpecialistSpecializationProps) {
  const config = categoryConfig

  // В режиме редактирования показываем все доступные поля из конфигурации
  if (!isEditMode && (!customFields || Object.keys(customFields).length === 0)) {
    return null
  }

  // Форматирование значения в зависимости от типа
  const formatValue = (value: any, type?: string) => {
    if (Array.isArray(value)) {
      return value
    }
    if (typeof value === 'number') {
      return `${value} мин`
    }
    return value
  }

  // Фильтруем только те поля, которые есть в customFields и в конфиге (для режима просмотра)
  const fields = Object.entries(config.fields)
    .filter(([key]) => customFields?.[key])
    .map(([key, fieldConfig]) => ({
      ...fieldConfig,
      value: customFields[key],
    }))

  if (!isEditMode && fields.length === 0) {
    return null
  }

  return (
    <motion.div
      id="specialization"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            🎯 Специализация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditMode && onSaveCustomField ? (
            // Режим редактирования - используем CustomFieldsEditor
            <CustomFieldsEditor
              customFields={customFields || {}}
              categoryFields={config.fields}
              isEditMode={isEditMode}
              onSave={onSaveCustomField}
            />
          ) : (
            // Режим просмотра - показываем только заполненные поля
            <>
              {fields.map(field => {
                const value = formatValue(field.value, field.type)

                return (
                  <div key={field.key}>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <span>{field.icon}</span>
                      <span>{field.label}</span>
                    </h4>

                    {Array.isArray(value) ? (
                      // Теги для массивов
                      <div className="flex flex-wrap gap-2">
                        {value.map((item, index) => (
                          <Tag key={index} variant="default">
                            {SESSION_FORMAT_LABELS[item] || item}
                          </Tag>
                        ))}
                      </div>
                    ) : (
                      // Текст для строк и чисел
                      <p className="text-gray-700">{value}</p>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}



