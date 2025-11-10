/**
 * Отображение лид-магнитов в профиле специалиста (современный UX 2025)
 * Компонент с заголовком (для обратной совместимости)
 * Для использования в композиции используйте SpecialistLeadMagnetsContent внутри Section
 */

'use client'

import { SpecialistLeadMagnetsContent, type SpecialistLeadMagnetsContentProps } from './SpecialistLeadMagnetsContent'

export interface SpecialistLeadMagnetsProps extends SpecialistLeadMagnetsContentProps {
  showTitle?: boolean
}

export function SpecialistLeadMagnets({
  leadMagnets,
  specialistSlug,
  specialistName,
  showTitle = true,
}: SpecialistLeadMagnetsProps) {
  return (
    <>
      {showTitle && (
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 text-sm">🎁</span>
          </span>
          <h2 className="text-xl font-semibold text-gray-900">Полезные материалы</h2>
        </div>
      )}
      <SpecialistLeadMagnetsContent
        leadMagnets={leadMagnets}
        specialistSlug={specialistSlug}
        specialistName={specialistName}
      />
    </>
  )
}

