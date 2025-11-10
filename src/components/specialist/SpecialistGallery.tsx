'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SpecialistGalleryContent, type SpecialistGalleryContentProps } from './SpecialistGalleryContent'

export type { GalleryItem } from './SpecialistGalleryContent'

export interface SpecialistGalleryProps extends SpecialistGalleryContentProps {
  showTitle?: boolean
}

/**
 * Компонент галереи с заголовком (для обратной совместимости)
 * Для использования в композиции используйте SpecialistGalleryContent внутри Section
 */
export function SpecialistGallery({ items, showTitle = true }: SpecialistGalleryProps) {
  if (!items || items.length === 0) {
    return null
  }

  return (
        <Card className="border-gray-200 shadow-sm">
      {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              🖼 Галерея
            </CardTitle>
          </CardHeader>
      )}
          <CardContent>
        <SpecialistGalleryContent items={items} />
          </CardContent>
        </Card>
  )
}



