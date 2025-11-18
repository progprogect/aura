/**
 * Компонент для скролла к нужному разделу на странице профиля
 * Используется при переходе с параметром ?section=...
 */

'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function ProfileSectionScroll() {
  const searchParams = useSearchParams()
  const section = searchParams.get('section')

  useEffect(() => {
    if (!section) return

    // Небольшая задержка для рендеринга контента
    const timeoutId = setTimeout(() => {
      const element = document.getElementById(`section-${section}`)
      if (element) {
        // Скролл с отступом сверху для лучшей видимости
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - 100 // 100px отступ сверху

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      }
    }, 300) // Задержка 300ms для рендеринга

    return () => clearTimeout(timeoutId)
  }, [section])

  return null
}

