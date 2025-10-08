/**
 * Toolbar для режима редактирования
 * Sticky bar с кнопками "Готово" и "Отмена"
 */

'use client'

import { Button } from '@/components/ui/button'
import { Check, X, Save } from 'lucide-react'
import { motion } from 'framer-motion'

interface EditToolbarProps {
  onSave?: () => void
  onCancel: () => void
  isSaving?: boolean
  hasUnsavedChanges?: boolean
}

export function EditToolbar({ onSave, onCancel, isSaving, hasUnsavedChanges }: EditToolbarProps) {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="
        sticky top-0 z-40
        bg-blue-600 text-white
        border-b border-blue-700
        shadow-lg
      "
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Левая часть: индикатор */}
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              Режим редактирования
            </span>
            {hasUnsavedChanges && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                Несохранённые изменения
              </span>
            )}
          </div>

          {/* Правая часть: кнопки */}
          <div className="flex items-center gap-2">
            {/* Десктоп */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-white hover:bg-white/20"
              >
                <X size={16} className="mr-2" />
                Отмена
              </Button>
              
              {onSave && (
                <Button
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Сохранить
                    </>
                  )}
                </Button>
              )}

              <Button
                size="sm"
                onClick={onCancel}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                <Check size={16} className="mr-2" />
                Готово
              </Button>
            </div>

            {/* Мобильный */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="text-white hover:bg-white/20 w-10 h-10"
              >
                <X size={20} />
              </Button>
              
              <Button
                size="icon"
                onClick={onCancel}
                className="bg-green-500 text-white hover:bg-green-600 w-10 h-10"
              >
                <Check size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Мобильная подсказка */}
        <div className="md:hidden mt-2">
          <p className="text-xs text-white/80">
            Нажмите на поля для редактирования. Изменения сохраняются автоматически.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

