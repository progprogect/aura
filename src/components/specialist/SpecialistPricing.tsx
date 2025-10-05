'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
// Убираем импорт иконок - используем внешние SVG
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface SpecialistPricingProps {
  category: string
  priceFrom?: number | null
  priceTo?: number | null
  currency: string
  priceDescription?: string | null
  priceLabel?: string // Передаем из server component
}

export function SpecialistPricing({
  category,
  priceFrom,
  priceTo,
  currency,
  priceDescription,
  priceLabel = 'за услугу',
}: SpecialistPricingProps) {
  if (!priceFrom && !priceTo) {
    return null
  }

  // Форматируем цену из копеек в рубли
  const formatPrice = (price: number) => {
    const rubles = price / 100
    return new Intl.NumberFormat('ru-RU', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rubles)
  }

  return (
    <motion.div
      id="pricing"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            💰 Стоимость
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </motion.div>
  )
}



