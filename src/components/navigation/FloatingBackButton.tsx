/**
 * Floating Action Button для возврата в каталог
 * Показывается только на mobile и только при скролле
 * Позиция: слева снизу (thumb zone)
 */

'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/ui/icons/Icon'
import { ArrowLeft } from '@/components/ui/icons/catalog-icons'
import { useScrollVisibility } from '@/hooks/useScrollVisibility'

interface FloatingBackButtonProps {
  /** URL для возврата */
  returnUrl: string
  
  /** Label для aria-label */
  label?: string
}

/**
 * Floating Action Button для возврата в каталог
 * 
 * Features:
 * - Появляется только при скролле вниз (>200px)
 * - Только на mobile (< 768px)
 * - Едва заметная (не отвлекает)
 * - Thumb zone (слева снизу)
 * - Spring анимация
 * - Haptic feedback на iOS
 * 
 * @example
 * <FloatingBackButton returnUrl="/catalog?category=psychology" label="Психология" />
 */
export function FloatingBackButton({
  returnUrl,
  label = 'Каталог',
}: FloatingBackButtonProps) {
  const router = useRouter()
  const isVisible = useScrollVisibility(200)

  const handleClick = () => {
    // Haptic feedback на iOS
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }

    router.push(returnUrl)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={handleClick}
          className="
            md:hidden
            fixed bottom-6 left-6 z-50
            w-10 h-10
            bg-white/80 backdrop-blur-sm
            rounded-full
            shadow-md
            border border-gray-200/50
            flex items-center justify-center
            hover:bg-white hover:shadow-lg
            active:scale-90
            transition-all duration-200
          "
          initial={{ scale: 0, opacity: 0, x: -20 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          exit={{ scale: 0, opacity: 0, x: -20 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          aria-label={`Вернуться к ${label}`}
        >
          <Icon
            icon={ArrowLeft}
            size={18}
            className="text-gray-600"
            aria-hidden
          />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

