/**
 * Floating кнопка для включения режима редактирования
 * Показывается только владельцу профиля
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit } from 'lucide-react'

interface EditModeToggleProps {
  isEditMode: boolean
  onToggle: () => void
}

export function EditModeToggle({ isEditMode, onToggle }: EditModeToggleProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Показываем кнопку при скролле вниз
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Если уже в режиме редактирования, не показываем кнопку
  if (isEditMode) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={onToggle}
          className="
            fixed bottom-6 right-6 z-50
            w-14 h-14
            bg-blue-600 text-white
            rounded-full
            shadow-lg hover:shadow-xl
            flex items-center justify-center
            hover:bg-blue-700
            active:scale-95
            transition-all duration-200
          "
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          aria-label="Редактировать профиль"
        >
          <Edit size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

