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

  // Проверка наличия полей в конфигурации категории
  // Если полей нет - скрываем блок (для будущего использования)
  if (!config.fields || Object.keys(config.fields).length === 0) {
    return null
  }

  // В режиме просмотра скрываем, если нет заполненных данных
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

  // В режиме просмотра фильтруем только заполненные поля
  const fields = !isEditMode 
    ? Object.entries(config.fields)
        .filter(([key]) => customFields?.[key])
        .map(([key, fieldConfig]) => ({
          ...fieldConfig,
          value: customFields[key],
        }))
    : [] // В режиме редактирования используем CustomFieldsEditor

  return (
    <motion.div
      id="specialization"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="pt-6 space-y-6">
          {isEditMode && onSaveCustomField ? (
            // Режим редактирования - используем CustomFieldsEditor
            <>
              {/* Пояснительный блок */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 text-xl mt-0.5">💡</div>
                  <div className="flex-1 text-sm text-blue-900">
                    <p className="font-semibold mb-2">О полях специализации:</p>
                    <ul className="space-y-1 text-blue-800">
                      <li>• <strong>Ключевые специализации</strong> - краткие теги для Hero и поиска (3-5 тегов)</li>
                      <li>• <strong>Детальная информация</strong> - специфичные поля вашей категории для глубокой фильтрации</li>
                      <li>• Все эти данные помогают клиентам найти именно вас через поиск и фильтры</li>
                    </ul>
                  </div>
                </div>
              </div>

              <CustomFieldsEditor
                customFields={customFields || {}}
                categoryFields={config.fields}
                isEditMode={isEditMode}
                onSave={onSaveCustomField}
              />
            </>
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



