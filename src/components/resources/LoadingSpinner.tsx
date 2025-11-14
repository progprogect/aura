/**
 * Спиннер загрузки для библиотеки ресурсов
 */

'use client'

import { Icon } from '@/components/ui/icons/Icon'
import { Loader2 } from '@/components/ui/icons/catalog-icons'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Icon
        icon={Loader2}
        size={32}
        className="animate-spin text-gray-400"
        aria-label="Загрузка ресурсов"
      />
    </div>
  )
}

