/**
 * Хук для восстановления позиции скролла при возврате в каталог
 */

'use client'

import { useEffect } from 'react'
import {
  restoreCatalogState,
  clearCatalogState,
} from '@/lib/navigation/scroll-restoration'

/**
 * Восстанавливает позицию скролла при возврате в каталог
 * 
 * @param route - Текущий route для проверки совпадения
 * @param dataLoaded - Загружены ли данные (ждём перед scroll)
 * 
 * @example
 * useScrollRestoration('/catalog?category=psychology', specialists.length > 0)
 */
export function useScrollRestoration(
  route: string,
  dataLoaded: boolean
): void {
  useEffect(() => {
    // Отключаем автоматическое восстановление браузера
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // Ждём пока данные загрузятся
    if (!dataLoaded) return

    // Пытаемся восстановить состояние
    const state = restoreCatalogState(route)

    if (state) {
      // requestAnimationFrame для плавности
      requestAnimationFrame(() => {
        window.scrollTo({
          top: state.scrollPosition,
          behavior: 'instant', // Instant для back navigation
        })

        // Очищаем после использования
        clearCatalogState()
      })
    }

    // Cleanup при размонтировании
    return () => {
      if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto'
      }
    }
  }, [route, dataLoaded])
}

