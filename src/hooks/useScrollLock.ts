/**
 * Хук для блокировки скролла основной страницы
 * Используется в модальных окнах
 */

'use client'

import { useEffect } from 'react'

/**
 * Блокирует скролл body при открытии модального окна
 * Автоматически восстанавливает при размонтировании
 * 
 * @param isLocked - Нужно ли блокировать скролл
 * 
 * @example
 * useScrollLock(isModalOpen)
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return

    // Сохраняем текущую позицию скролла
    const scrollY = window.scrollY
    const body = document.body
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // Блокируем скролл
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    
    // Компенсируем ширину scrollbar (для предотвращения layout shift)
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    // Cleanup: восстанавливаем скролл
    return () => {
      body.style.position = ''
      body.style.top = ''
      body.style.width = ''
      body.style.paddingRight = ''
      
      // Восстанавливаем позицию
      window.scrollTo(0, scrollY)
    }
  }, [isLocked])
}

