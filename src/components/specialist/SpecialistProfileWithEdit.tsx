/**
 * Клиентская обёртка для профиля специалиста с режимом редактирования
 * Определяет владельца и управляет режимом редактирования
 */

'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SpecialistProfile } from './SpecialistProfile'
import { EditModeToggle } from './edit/EditModeToggle'
import { EditToolbar } from './edit/EditToolbar'
import type { Tab } from './SpecialistTabs'
import type { CategoryConfig } from '@/lib/category-config'

interface SpecialistProfileWithEditProps {
  isOwner: boolean
  tabs: Tab[]
  categoryConfig: CategoryConfig | null
  data: {
    id: string
    fullName: string
    category: string
    about: string
    customFields?: any
    videoUrl?: string | null
    gallery: Array<{
      id: string
      type: 'photo' | 'video'
      url: string
      thumbnailUrl?: string | null
      caption?: string | null
    }>
    education: Array<{
      id: string
      institution: string
      degree: string
      year: number
      description?: string | null
    }>
    certificates: Array<{
      id: string
      title: string
      organization: string
      year: number
      fileUrl?: string | null
    }>
    priceFrom?: number | null
    priceTo?: number | null
    currency: string
    priceDescription?: string | null
    faqs: Array<{
      id: string
      question: string
      answer: string
    }>
  }
}

export function SpecialistProfileWithEdit({ 
  isOwner, 
  tabs, 
  categoryConfig, 
  data 
}: SpecialistProfileWithEditProps) {
  const [isEditMode, setIsEditMode] = useState(false)

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev)
  }, [])

  const handleExitEditMode = useCallback(() => {
    setIsEditMode(false)
    // Перезагружаем страницу чтобы обновить данные
    window.location.reload()
  }, [])

  // Функция для сохранения изменений
  const handleSaveField = useCallback(async (field: string, value: string | number) => {
    try {
      const response = await fetch('/api/specialist/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Ошибка сохранения')
      }

      return result
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      throw error
    }
  }, [])

  return (
    <>
      {/* Toolbar для режима редактирования */}
      <AnimatePresence>
        {isEditMode && isOwner && (
          <EditToolbar 
            onCancel={handleExitEditMode}
          />
        )}
      </AnimatePresence>

      {/* Профиль */}
      <SpecialistProfile
        tabs={tabs}
        categoryConfig={categoryConfig}
        data={data}
        isEditMode={isEditMode && isOwner}
        onSaveField={handleSaveField}
      />

      {/* Floating кнопка "Редактировать" */}
      {isOwner && (
        <EditModeToggle
          isEditMode={isEditMode}
          onToggle={handleToggleEditMode}
        />
      )}
    </>
  )
}

