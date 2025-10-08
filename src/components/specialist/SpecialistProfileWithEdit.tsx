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
import { SpecialistAbout } from './SpecialistAbout'
import { SpecialistSpecialization } from './SpecialistSpecialization'
import { SpecialistVideo } from './SpecialistVideo'
import { SpecialistGallery } from './SpecialistGallery'
import { SpecialistEducation } from './SpecialistEducation'
import { SpecialistPricing } from './SpecialistPricing'
import { SpecialistFAQ } from './SpecialistFAQ'
import { SpecialistContactForClients } from './SpecialistContactForClients'
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


      {/* Профиль - разные режимы для клиентов и специалиста */}
      {isOwner ? (
        // Режим редактирования для специалиста - без табов, все поля видны
        <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
          
          {/* Hero Edit секция (в режиме редактирования) */}
          {isEditMode && (
            <div className="space-y-6">
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 text-sm">📧</span>
                  </span>
                  Личные контакты
                </h2>
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
          
          {/* О себе */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">👤</span>
              </span>
              О себе
            </h2>
            <SpecialistAbout 
              about={data.about} 
              onSave={handleSaveField}
            />
          </div>

          {/* Специализация */}
          {categoryConfig && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm">✨</span>
                </span>
                Специализация
              </h2>
              <SpecialistSpecialization
                category={data.category}
                customFields={data.customFields}
                categoryConfig={categoryConfig}
                onSaveCustomField={handleSaveCustomField}
              />
            </div>
          )}

          {/* Видео-презентация */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-sm">🎥</span>
              </span>
              Видео-презентация
            </h2>
            {data.videoUrl ? (
              <SpecialistVideo videoUrl={data.videoUrl} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isEditMode ? (
                  <div className="space-y-2">
                    <p>Добавьте видео-презентацию</p>
                    <p className="text-sm">Это поможет клиентам лучше узнать вас</p>
                  </div>
                ) : (
                  <p>Видео-презентация не добавлена</p>
                )}
              </div>
            )}
          </div>

          {/* Галерея */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">📸</span>
              </span>
              Галерея
            </h2>
            {data.gallery.length > 0 ? (
              <SpecialistGallery items={data.gallery} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isEditMode ? (
                  <div className="space-y-2">
                    <p>Добавьте фото и видео в галерею</p>
                    <p className="text-sm">Покажите примеры вашей работы</p>
                  </div>
                ) : (
                  <p>Галерея пуста</p>
                )}
              </div>
            )}
          </div>

          {/* Образование и сертификаты */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-sm">🎓</span>
              </span>
              Образование и сертификаты
            </h2>
            <SpecialistEducation
              education={data.education}
              certificates={data.certificates}
            />
          </div>

          {/* Стоимость */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 text-sm">💰</span>
              </span>
              Стоимость услуг
            </h2>
            <SpecialistPricing
              category={data.category}
              priceFrom={data.priceFrom}
              priceTo={data.priceTo}
              currency={data.currency}
              priceDescription={data.priceDescription}
              onSave={handleSaveField}
            />
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 text-sm">❓</span>
              </span>
              Часто задаваемые вопросы
            </h2>
            <SpecialistFAQ
              faqs={data.faqs}
            />
          </div>

          {/* Контакты для связи - только в режиме редактирования */}
          {isEditMode && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-sm">📞</span>
                </span>
                Контакты для связи с клиентами
              </h2>
              <SpecialistContactForClients
                email={contactsData.email}
                telegram={contactsData.telegram}
                whatsapp={contactsData.whatsapp}
                onSave={handleSaveField}
              />
            </div>
          )}

        </div>
      ) : (
        // Режим просмотра для клиентов - с табами (идеальный профиль)
        <SpecialistProfile
          tabs={tabs}
          categoryConfig={categoryConfig}
          data={data}
          isEditMode={false}
          onSaveField={handleSaveField}
          onSaveCustomField={handleSaveCustomField}
        />
      )}

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

