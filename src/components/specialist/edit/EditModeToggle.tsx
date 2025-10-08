/**
 * Floating кнопка для включения режима редактирования
 * Показывается только владельцу профиля
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Edit } from 'lucide-react'

interface EditModeToggleProps {
  isEditMode: boolean
  onToggle: () => void
}

export function EditModeToggle({ isEditMode, onToggle }: EditModeToggleProps) {
  // Если уже в режиме редактирования, не показываем кнопку
  if (isEditMode) {
    return null
  }

  return (
    <motion.button
      onClick={onToggle}
      className="
        fixed bottom-6 right-6 z-50
        bg-blue-600 text-white
        rounded-full
        shadow-lg hover:shadow-xl
        flex items-center gap-2
        hover:bg-blue-700
        active:scale-95
        transition-all duration-200
        px-4 py-3
        min-w-[auto] sm:min-w-[140px]
        h-auto sm:h-12
      "
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      aria-label="Редактировать профиль"
    >
      <Edit size={20} className="flex-shrink-0" />
      <span className="hidden sm:inline text-sm font-medium">
        Редактировать
      </span>
    </motion.button>
  )
}

