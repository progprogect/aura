/**
 * Базовый компонент стоимости без заголовка и обертки
 * Используется внутри Section для композиции
 */

'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { InlineInput } from './edit/InlineInput'
import { formatPointsDisplay } from '@/lib/formatters/points-display'

export interface SpecialistPricingContentProps {
  category: string
  priceFromInPoints?: number | null
  priceToInPoints?: number | null
  priceDescription?: string | null
  priceLabel?: string
  isEditMode?: boolean
  onSave?: (field: string, value: string | number) => Promise<any>
}

export function SpecialistPricingContent({
  category,
  priceFromInPoints,
  priceToInPoints,
  priceDescription,
  priceLabel = 'за услугу',
  isEditMode = false,
  onSave,
}: SpecialistPricingContentProps) {
  if (!priceFromInPoints && !priceToInPoints && !isEditMode) {
    return null
  }

  return (
    <motion.div
      id="pricing"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4"
    >
      {isEditMode && onSave ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InlineInput
              value={priceFromInPoints || ''}
              field="priceFromInPoints"
              onSave={onSave}
              isEditMode={isEditMode}
              placeholder="100"
              type="number"
              label="Цена от (баллов)"
            />
            
            <InlineInput
              value={priceToInPoints || ''}
              field="priceToInPoints"
              onSave={onSave}
              isEditMode={isEditMode}
              placeholder="200"
              type="number"
              label="Цена до (баллов)"
            />
          </div>

          <InlineInput
            value={priceDescription || ''}
            field="priceDescription"
            onSave={onSave}
            isEditMode={isEditMode}
            placeholder="за сессию 60 минут"
            label="Описание цены"
            maxLength={100}
          />
        </>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {priceFromInPoints && priceToInPoints && priceFromInPoints !== priceToInPoints
                ? `${formatPointsDisplay(priceFromInPoints)} - ${formatPointsDisplay(priceToInPoints)}`
                : formatPointsDisplay(priceFromInPoints || priceToInPoints || 0)}
            </span>
            <span className="text-lg text-gray-600">баллов</span>
          </div>

          {priceDescription && (
            <p className="mt-2 text-sm text-gray-600">{priceDescription}</p>
          )}

          {!priceDescription && (
            <p className="mt-2 text-sm text-gray-600">{priceLabel}</p>
          )}
        </>
      )}
    </motion.div>
  )
}

