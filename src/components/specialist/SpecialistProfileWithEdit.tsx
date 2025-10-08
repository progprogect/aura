/**
 * Клиентская обёртка для профиля специалиста с режимом редактирования
 * Определяет владельца и управляет режимом редактирования
 */

'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SpecialistProfile } from './SpecialistProfile'
import { SpecialistHeroEdit } from './SpecialistHeroEdit'
import { ContactsEditor } from './edit/ContactsEditor'
import { EditModeToggle } from './edit/EditModeToggle'
import { EditToolbar } from './edit/EditToolbar'
import type { Tab } from './SpecialistTabs'
import type { CategoryConfig } from '@/lib/category-config'

interface SpecialistProfileWithEditProps {
  isOwner: boolean
  tabs: Tab[]
  categoryConfig: CategoryConfig | null
  heroData: {
    firstName: string
    lastName: string
    avatar: string | null
    tagline: string | null
    city: string | null
    specializations: string[]
  }
  contactsData: {
    email: string | null
    telegram: string | null
    whatsapp: string | null
    instagram: string | null
    website: string | null
  }
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
  heroData,
  contactsData,
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

  // Функция для сохранения одного поля
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

  // Функция для сохранения массивов
  const handleSaveArray = useCallback(async (field: string, values: string[]) => {
    try {
      const response = await fetch('/api/specialist/profile/arrays', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value: values })
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

  // Функция для сохранения кастомных полей
  const handleSaveCustomField = useCallback(async (key: string, value: any) => {
    try {
      const response = await fetch('/api/specialist/profile/custom-fields', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Ошибка сохранения')
      }

      return result
    } catch (error) {
      console.error('Ошибка сохранения кастомного поля:', error)
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

      {/* Hero Edit секция (в режиме редактирования) */}
      {isEditMode && isOwner && (
        <div className="space-y-6 pb-6">
          <SpecialistHeroEdit
            firstName={heroData.firstName}
            lastName={heroData.lastName}
            avatar={heroData.avatar}
            tagline={heroData.tagline}
            city={heroData.city}
            specializations={heroData.specializations}
            onSaveField={handleSaveField}
            onSaveArray={handleSaveArray}
            onRefresh={handleExitEditMode}
          />
          
          {/* Контакты в режиме редактирования */}
          <div className="container mx-auto max-w-4xl px-4">
            <ContactsEditor
              email={contactsData.email}
              telegram={contactsData.telegram}
              whatsapp={contactsData.whatsapp}
              instagram={contactsData.instagram}
              website={contactsData.website}
              onSave={handleSaveField}
            />
          </div>
        </div>
      )}

      {/* Профиль */}
      <SpecialistProfile
        tabs={tabs}
        categoryConfig={categoryConfig}
        data={data}
        isEditMode={isEditMode && isOwner}
        onSaveField={handleSaveField}
        onSaveCustomField={handleSaveCustomField}
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

