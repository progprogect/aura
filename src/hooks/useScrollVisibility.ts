/**
 * Хук для определения видимости элемента при скролле
 * Используется для FAB кнопки "Назад"
 */

'use client'

import { useState, useEffect } from 'react'

/**
 * Определяет должен ли элемент быть виден на основе позиции скролла
 * 
 * @param threshold - Порог скролла в пикселях (по умолчанию 200)
 * @returns true если прокрутили больше threshold
 * 
 * @example
 * const isVisible = useScrollVisibility(200)
 * 
 * return isVisible && <FloatingButton />
 */
export function useScrollVisibility(threshold: number = 200): boolean {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold)
    }

    // Слушаем scroll с passive для производительности
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Проверяем сразу при монтировании
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return isVisible
}

