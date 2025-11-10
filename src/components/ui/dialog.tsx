/**
 * Простой Dialog компонент
 * Мобильный - Bottom Sheet, Десктоп - Modal
 */

'use client'

import { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from './button'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function Dialog({ isOpen, onClose, title, children, footer }: DialogProps) {
  // Блокируем скролл при открытии
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal/Bottom Sheet */}
          <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center pointer-events-none">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              className="
                w-full md:w-[800px]
                bg-white rounded-t-2xl md:rounded-2xl
                shadow-2xl
                max-h-[95vh] md:max-h-[90vh]
                overflow-hidden
                pointer-events-auto
                safe-area-inset-bottom
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X size={20} />
                </Button>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(95vh-140px)] md:max-h-[calc(90vh-140px)]">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="p-4 md:p-6 border-t bg-gray-50 safe-area-inset-bottom">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

