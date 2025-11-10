'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SpecialistPricingContent, type SpecialistPricingContentProps } from './SpecialistPricingContent'

export interface SpecialistPricingProps extends SpecialistPricingContentProps {
  showTitle?: boolean
}

/**
 * Компонент стоимости с заголовком (для обратной совместимости)
 * Для использования в композиции используйте SpecialistPricingContent внутри Section
 */
export function SpecialistPricing({
  category,
  priceFrom,
  priceTo,
  currency,
  priceDescription,
  priceLabel = 'за услугу',
  isEditMode = false,
  onSave,
  showTitle = true,
}: SpecialistPricingProps) {
  if (!priceFrom && !priceTo && !isEditMode) {
    return null
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            💰 Стоимость
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <SpecialistPricingContent
          category={category}
          priceFrom={priceFrom}
          priceTo={priceTo}
          currency={currency}
          priceDescription={priceDescription}
          priceLabel={priceLabel}
          isEditMode={isEditMode}
          onSave={onSave}
        />
      </CardContent>
    </Card>
  )
}



