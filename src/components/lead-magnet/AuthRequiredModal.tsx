/**
 * Модальное окно для неавторизованных пользователей
 * Предлагает войти или зарегистрироваться
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, LogIn, UserPlus, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AuthRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  leadMagnetTitle?: string
  priceInPoints?: number | null
}

export function AuthRequiredModal({
  isOpen,
  onClose,
  leadMagnetTitle,
  priceInPoints,
}: AuthRequiredModalProps) {
  if (!isOpen) return null

  const isPaid = priceInPoints !== null && priceInPoints > 0

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="relative z-10 w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <LogIn className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Требуется вход
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {isPaid 
                ? `Для получения лид-магнита "${leadMagnetTitle}" необходимо войти в систему`
                : 'Для получения лид-магнита необходимо войти в систему'
              }
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            {/* Информация о бонусах */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Coins className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900 mb-1">
                    Бонус при регистрации!
                  </p>
                  <p className="text-xs text-green-700">
                    После регистрации вы получите 50 бонусных баллов для первой покупки
                  </p>
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/auth/user/login" onClick={onClose} className="flex-1">
                <Button className="w-full gap-2" size="lg">
                  <LogIn size={18} />
                  Войти
                </Button>
              </Link>
              <Link href="/auth/user/register" onClick={onClose} className="flex-1">
                <Button variant="outline" className="w-full gap-2" size="lg">
                  <UserPlus size={18} />
                  Зарегистрироваться
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

