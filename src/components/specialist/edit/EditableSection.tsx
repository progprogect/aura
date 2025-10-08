/**
 * Обёртка для редактируемой секции профиля
 * Добавляет иконку карандаша и подсветку при наведении
 */

'use client'

import { ReactNode } from 'react'
import { Edit2 } from 'lucide-react'

interface EditableSectionProps {
  children: ReactNode
  isEditMode: boolean
  title?: string
  onClick?: () => void
}

export function EditableSection({ children, isEditMode, title, onClick }: EditableSectionProps) {
  if (!isEditMode) {
    return <>{children}</>
  }

  return (
    <div
      className={`
        relative
        ${onClick ? 'cursor-pointer' : ''}
        ${onClick ? 'group hover:bg-blue-50/50' : ''}
        rounded-lg
        transition-colors duration-200
        ${onClick ? 'p-4 -m-4' : ''}
      `}
      onClick={onClick}
    >
      {/* Иконка редактирования */}
      {onClick && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-1.5 bg-blue-600 text-white rounded-md shadow-sm">
            <Edit2 size={14} />
          </div>
        </div>
      )}

      {/* Заголовок секции (если есть) */}
      {title && onClick && (
        <div className="mb-2 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          Нажмите для редактирования
        </div>
      )}

      {children}
    </div>
  )
}

