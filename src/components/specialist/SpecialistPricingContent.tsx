/**
 * Базовый компонент стоимости без заголовка и обертки
 * Используется внутри Section для композиции
 */

'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { InlineInput } from './edit/InlineInput'

export interface SpecialistPricingContentProps {
  category: string
  priceFrom?: number | null
  priceTo?: number | null
  currency: string
  priceDescription?: string | null
  priceLabel?: string
  isEditMode?: boolean
  onSave?: (field: string, value: string | number) => Promise<any>
}

export function SpecialistPricingContent({
  category,
  priceFrom,
  priceTo,
  currency,
  priceDescription,
  priceLabel = 'за услугу',
  isEditMode = false,
  onSave,
}: SpecialistPricingContentProps) {
  if (!priceFrom && !priceTo && !isEditMode) {
    return null
  }

  // Форматируем цену из копеек в рубли для отображения
  const formatPrice = (price: number) => {
    const rubles = price / 100
    return new Intl.NumberFormat('ru-RU', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rubles)
  }

  // Конвертируем копейки в рубли для редактирования
  const priceFromRubles = priceFrom ? priceFrom / 100 : null
  const priceToRubles = priceTo ? priceTo / 100 : null

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
              value={priceFromRubles}
              field="priceFrom"
              onSave={async (field, value) => {
                // Конвертируем рубли обратно в копейки
                const priceInKopecks = typeof value === 'number' ? value * 100 : 0
                return onSave(field, priceInKopecks)
              }}
              isEditMode={isEditMode}
              placeholder="3000"
              type="number"
              label="Цена от (₽)"
            />
            
            <InlineInput
              value={priceToRubles}
              field="priceTo"
              onSave={async (field, value) => {
                // Конвертируем рубли обратно в копейки
                const priceInKopecks = typeof value === 'number' ? value * 100 : 0
                return onSave(field, priceInKopecks)
              }}
              isEditMode={isEditMode}
              placeholder="5000"
              type="number"
              label="Цена до (₽)"
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
              {priceFrom && priceTo && priceFrom !== priceTo
                ? `${formatPrice(priceFrom)} - ${formatPrice(priceTo)}`
                : formatPrice(priceFrom || priceTo || 0)}
            </span>
            <span className="text-lg text-gray-600">₽</span>
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

