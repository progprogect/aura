/**
 * Отображение услуг в профиле специалиста
 * Для использования в композиции используйте SpecialistServicesContent внутри Section
 */

'use client'

import { SpecialistServicesContent, type SpecialistServicesContentProps } from './SpecialistServicesContent'

interface SpecialistServicesProps extends SpecialistServicesContentProps {
  showTitle?: boolean
}

/**
 * Компонент услуг с заголовком (для обратной совместимости)
 * Для использования в композиции используйте SpecialistServicesContent внутри Section
 */
export function SpecialistServices({ services, specialistSlug, showTitle = true }: SpecialistServicesProps) {
  if (services.length === 0) {
    return null
  }

  return (
    <>
      {showTitle && (
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 text-sm">💼</span>
          </span>
          <h2 className="text-xl font-semibold text-gray-900">Услуги</h2>
        </div>
      )}
      <SpecialistServicesContent services={services} specialistSlug={specialistSlug} />
    </>
  )
}

