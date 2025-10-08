/**
 * Клиентская обёртка для профиля специалиста с режимом редактирования
 * Определяет владельца и управляет режимом редактирования
 */

'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SpecialistProfile } from './SpecialistProfile'
import { SpecialistHero } from './SpecialistHero'
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
import { VideoUrlEditor } from './edit/VideoUrlEditor'
import { GalleryEditor } from './edit/GalleryEditor'
import { FAQEditor } from './edit/FAQEditor'
import { LeadMagnetsEditor } from './edit/LeadMagnetsEditor'
import { SpecialistLeadMagnets } from './SpecialistLeadMagnets'
import type { Tab } from './SpecialistTabs'
import type { CategoryConfig } from '@/lib/category-config'

interface SpecialistProfileWithEditProps {
  isOwner: boolean
  tabs: Tab[]
  categoryConfig: CategoryConfig | null
  heroData: {
    firstName: string | null
    lastName: string | null
    avatar: string | null
    category: string
    categoryEmoji?: string
    tagline: string | null
    city: string | null
    country?: string
    workFormats: string[]
    yearsOfPractice?: number | null
    verified: boolean
    profileViews: number
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
    leadMagnets: Array<{
      id: string
      type: 'file' | 'link' | 'service'
      title: string
      description: string
      fileUrl?: string | null
      linkUrl?: string | null
      emoji: string
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


      {/* Hero - показываем всегда, кроме режима редактирования */}
      {(!isOwner || (isOwner && !isEditMode)) && (
        <SpecialistHero
          firstName={heroData.firstName}
          lastName={heroData.lastName}
          avatar={heroData.avatar}
          category={heroData.category}
          categoryEmoji={heroData.categoryEmoji}
          specializations={heroData.specializations}
          tagline={heroData.tagline}
          city={heroData.city}
          country={heroData.country}
          workFormats={heroData.workFormats}
          yearsOfPractice={heroData.yearsOfPractice}
          verified={heroData.verified}
          profileViews={heroData.profileViews}
          email={contactsData.email}
          telegram={contactsData.telegram}
          whatsapp={contactsData.whatsapp}
          instagram={contactsData.instagram}
          website={contactsData.website}
        />
      )}

      {/* Профиль - разные режимы для клиентов и специалиста */}
      {isOwner ? (
        // Режим редактирования для специалиста - без табов, все поля видны
        <div className="container mx-auto max-w-5xl space-y-4 px-4 py-6">
          
          {/* Hero Edit секция (в режиме редактирования) */}
          {isEditMode && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-sm">✏️</span>
                  </span>
                  <span className="text-base sm:text-xl">Основная информация</span>
                </h2>
                <SpecialistHeroEdit
                  firstName={heroData.firstName}
                  lastName={heroData.lastName}
                  avatar={heroData.avatar}
                  category={data.category}
                  tagline={heroData.tagline}
                  city={heroData.city}
                  specializations={heroData.specializations}
                  onSaveField={handleSaveField}
                  onSaveArray={handleSaveArray}
                  onRefresh={handleExitEditMode}
                />
              </div>
              
              {/* Контакты для связи */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-sm">📞</span>
                  </span>
                  <span className="text-base sm:text-xl">Контакты для связи</span>
                </h2>
                
                {/* Пояснительный блок */}
                <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-orange-600 text-xl mt-0.5">ℹ️</div>
                    <div className="flex-1 text-sm text-orange-900">
                      <p className="font-semibold mb-2">Контакты для клиентов:</p>
                      <ul className="space-y-1 text-orange-800">
                        <li>• Эти контакты будут отображаться в кнопке &quot;Показать контакты&quot;</li>
                        <li>• Клиенты смогут скопировать их или перейти по ссылке</li>
                        <li>• Укажите те контакты, по которым готовы общаться с клиентами</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <ContactsEditor
                  email={contactsData.email}
                  telegram={contactsData.telegram}
                  whatsapp={contactsData.whatsapp}
                  instagram={contactsData.instagram}
                  website={contactsData.website}
                  onSave={handleSaveField}
                />
              </div>
            </>
          )}
          
          {/* О себе */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">👤</span>
              </span>
              <span className="text-base sm:text-xl">О себе</span>
            </h2>
            <SpecialistAbout 
              about={data.about}
              isEditMode={isEditMode}
              onSave={handleSaveField}
            />
          </div>

          {/* Специализация */}
          {categoryConfig && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm">✨</span>
                </span>
                <span className="text-base sm:text-xl">Специализация</span>
              </h2>
              <SpecialistSpecialization
                category={data.category}
                customFields={data.customFields}
                categoryConfig={categoryConfig}
                isEditMode={isEditMode}
                onSaveCustomField={handleSaveCustomField}
              />
            </div>
          )}

          {/* Видео-презентация */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-sm">🎥</span>
              </span>
              <span className="text-base sm:text-xl">Видео-презентация</span>
            </h2>
            {isEditMode ? (
              <VideoUrlEditor
                videoUrl={data.videoUrl}
                onSave={handleSaveField}
                onRemove={async () => {
                  await handleSaveField('videoUrl', '')
                }}
              />
            ) : (
              data.videoUrl ? (
                <SpecialistVideo videoUrl={data.videoUrl} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Видео-презентация не добавлена</p>
                </div>
              )
            )}
          </div>

          {/* Галерея */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">📸</span>
              </span>
              <span className="text-base sm:text-xl">Галерея</span>
            </h2>
            {isEditMode ? (
              <GalleryEditor
                items={data.gallery}
                onRefresh={() => window.location.reload()}
              />
            ) : (
              data.gallery.length > 0 ? (
                <SpecialistGallery items={data.gallery} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Галерея пуста</p>
                </div>
              )
            )}
          </div>

          {/* Образование и сертификаты */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-sm">🎓</span>
              </span>
              <span className="text-base sm:text-xl">Образование и сертификаты</span>
            </h2>
            <SpecialistEducation
              education={data.education}
              certificates={data.certificates}
              isEditMode={isEditMode}
              onRefresh={() => window.location.reload()}
            />
          </div>

          {/* Стоимость */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 text-sm">💰</span>
              </span>
              <span className="text-base sm:text-xl">Стоимость услуг</span>
            </h2>
            <SpecialistPricing
              category={data.category}
              priceFrom={data.priceFrom}
              priceTo={data.priceTo}
              currency={data.currency}
              priceDescription={data.priceDescription}
              isEditMode={isEditMode}
              onSave={handleSaveField}
            />
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 text-sm">❓</span>
              </span>
              <span className="text-base sm:text-xl">Часто задаваемые вопросы</span>
            </h2>
            {isEditMode ? (
              <FAQEditor
                faqs={data.faqs}
                onRefresh={() => window.location.reload()}
              />
            ) : (
              data.faqs.length > 0 ? (
                <SpecialistFAQ faqs={data.faqs} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>FAQ не добавлены</p>
                </div>
              )
            )}
          </div>

          {/* Лид-магниты */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                <span className="text-pink-600 text-sm">🎁</span>
              </span>
              <span className="text-base sm:text-xl">Лид-магниты</span>
            </h2>
            {isEditMode ? (
              <LeadMagnetsEditor
                leadMagnets={data.leadMagnets}
                onRefresh={() => window.location.reload()}
              />
            ) : (
              data.leadMagnets.length > 0 ? (
                <SpecialistLeadMagnets
                  leadMagnets={data.leadMagnets}
                  specialistId={data.id}
                  specialistName={data.fullName}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Лид-магниты не добавлены</p>
                </div>
              )
            )}
          </div>

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

