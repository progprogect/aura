'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SpecialistFAQContent, type SpecialistFAQContentProps } from './SpecialistFAQContent'

export type { FAQ } from './SpecialistFAQContent'

export interface SpecialistFAQProps extends SpecialistFAQContentProps {
  showTitle?: boolean
}

/**
 * Компонент FAQ с заголовком (для обратной совместимости)
 * Для использования в композиции используйте SpecialistFAQContent внутри Section
 */
export function SpecialistFAQ({ faqs, showTitle = true }: SpecialistFAQProps) {
  if (!faqs || faqs.length === 0) {
    return null
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            ❓ Частые вопросы
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <SpecialistFAQContent faqs={faqs} />
      </CardContent>
    </Card>
  )
}



