'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SpecialistEducationContent, type SpecialistEducationContentProps } from './SpecialistEducationContent'

export type { Education, Certificate } from './SpecialistEducationContent'

export interface SpecialistEducationProps extends SpecialistEducationContentProps {
  showTitle?: boolean
}

/**
 * Компонент образования с заголовком (для обратной совместимости)
 * Для использования в композиции используйте SpecialistEducationContent внутри Section
 */
export function SpecialistEducation({ 
  education, 
  certificates, 
  isEditMode = false,
  onRefresh,
  showTitle = true
}: SpecialistEducationProps) {
  if (!isEditMode && education.length === 0 && certificates.length === 0) {
    return null
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            🎓 Образование и квалификации
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <SpecialistEducationContent
          education={education}
          certificates={certificates}
          isEditMode={isEditMode}
          onRefresh={onRefresh}
        />
      </CardContent>
    </Card>
  )
}



