/**
 * Клиентская обёртка для профиля специалиста с режимом редактирования
 * Определяет владельца и управляет режимом редактирования
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { SpecialistProfile } from './SpecialistProfile'
import { SpecialistHero } from './SpecialistHero'
import { SpecialistHeroEdit } from './SpecialistHeroEdit'
import { ContactsEditor } from './edit/ContactsEditor'
import { EditModeToggle } from './edit/EditModeToggle'
import { EditToolbar } from './edit/EditToolbar'
import { AcceptingClientsToggle } from './edit/AcceptingClientsToggle'
import { SpecialistAbout } from './SpecialistAbout'
import { SpecialistSpecialization } from './SpecialistSpecialization'
import { SpecialistVideo } from './SpecialistVideo'
import { SpecialistGalleryContent } from './SpecialistGalleryContent'
import { PortfolioEditor } from './edit/PortfolioEditor'
import { PortfolioContent } from './PortfolioContent'
import { SpecialistEducationContent } from './SpecialistEducationContent'
import { SpecialistPricingContent } from './SpecialistPricingContent'
import { SpecialistFAQContent } from './SpecialistFAQContent'
import { SpecialistServicesContent } from './SpecialistServicesContent'
import { SpecialistLeadMagnetsContent } from './SpecialistLeadMagnetsContent'
import { Section } from './Section'
import { VideoUrlEditor } from './edit/VideoUrlEditor'
import { GalleryEditor } from './edit/GalleryEditor'
import { FAQEditor } from './edit/FAQEditor'
import type { Tab } from './SpecialistTabs'
import type { CategoryConfig } from '@/lib/category-config'
import type { Service } from '@/types/service'
import type { ReviewsResponse } from '@/types/review'

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
    categoryName?: string
    tagline: string | null
    city: string | null
    country?: string
    workFormats: string[]
    yearsOfPractice?: number | null
    verified: boolean
    acceptingClients: boolean
    profileViews: number
    specializations: string[]
    averageRating?: number
    totalReviews?: number
  }
  contactsData: {
    email: string | null
    phone: string | null // Телефон из User.phone для отображения в контактах
    telegram: string | null
    whatsapp: string | null
    website: string | null
  }
  data: {
    id: string
    slug: string
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
    portfolio: Array<{
      id: string
      type: 'photo' | 'video'
      url: string
      thumbnailUrl?: string | null
      title: string
      description?: string | null
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
      slug?: string | null
    }>
    services?: Service[]
    averageRating?: number
    totalReviews?: number
    initialReviews?: ReviewsResponse
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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isEditMode, setIsEditMode] = useState(false)
  const [acceptingClients, setAcceptingClients] = useState(heroData.acceptingClients)

  // Обработка URL параметров для автоматического включения режима редактирования
  useEffect(() => {
    if (!isOwner) return

    const editParam = searchParams.get('edit')
    
    // Автоматически включаем режим редактирования если ?edit=true
    if (editParam === 'true' && !isEditMode) {
      setIsEditMode(true)
    }
  }, [searchParams, isOwner, isEditMode])

  // Скролл к секции после включения режима редактирования
  useEffect(() => {
    if (!isOwner || !isEditMode) return

    const sectionParam = searchParams.get('section')
    
    if (sectionParam) {
      // Функция для скролла с несколькими попытками
      const scrollToSection = (attempts = 0) => {
        const sectionElement = document.getElementById(`section-${sectionParam}`)
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          // Небольшой отступ сверху для лучшей видимости
          setTimeout(() => {
            window.scrollBy(0, -20)
          }, 100)
        } else if (attempts < 5) {
          // Повторяем попытку с задержкой, если элемент еще не отрендерился
          setTimeout(() => scrollToSection(attempts + 1), 200)
        }
      }

      // Задержка для рендеринга секций в режиме редактирования
      const timeoutId = setTimeout(() => {
        scrollToSection()
      }, 600)

      return () => clearTimeout(timeoutId)
    }
  }, [isEditMode, searchParams, isOwner])

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev)
  }, [])

  const handleExitEditMode = useCallback(() => {
    setIsEditMode(false)
    
    // Проверяем, есть ли параметр from в URL (для возврата на предыдущую страницу)
    const fromParam = searchParams.get('from')
    
    if (fromParam === 'profile') {
      // Возвращаемся на страницу профиля
      router.push('/profile')
      // Обновляем данные на странице профиля
      router.refresh()
    } else {
      // Убираем параметры edit, section и from из URL
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('edit')
      newSearchParams.delete('section')
      newSearchParams.delete('from')
      
      const newUrl = newSearchParams.toString()
        ? `${pathname}?${newSearchParams.toString()}`
        : pathname
      
      // Используем replace вместо push, чтобы не добавлять новую запись в историю
      router.replace(newUrl)
      // Обновляем данные после изменения URL
      router.refresh()
    }
  }, [router, searchParams, pathname])

  // Функция для сохранения одного поля
  const handleSaveField = useCallback(async (field: string, value: string | number | boolean) => {
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

  // Функция для переключения статуса приема клиентов
  const handleToggleAcceptingClients = useCallback(async (value: boolean) => {
    const result = await handleSaveField('acceptingClients', value)
    if (result.success) {
      setAcceptingClients(value)
    }
  }, [handleSaveField])

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
          specialistId={data.id}
          firstName={heroData.firstName}
          lastName={heroData.lastName}
          avatar={heroData.avatar}
          category={heroData.category}
          categoryEmoji={heroData.categoryEmoji}
          categoryName={heroData.categoryName}
          specializations={heroData.specializations}
          tagline={heroData.tagline}
          city={heroData.city}
          country={heroData.country}
          workFormats={heroData.workFormats}
          yearsOfPractice={heroData.yearsOfPractice}
          verified={heroData.verified}
          profileViews={heroData.profileViews}
          averageRating={heroData.averageRating}
          totalReviews={heroData.totalReviews}
          email={contactsData.email}
          phone={contactsData.phone}
          telegram={contactsData.telegram}
          whatsapp={contactsData.whatsapp}
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
              <div id="section-hero" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
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
                  phone={contactsData.phone}
                  telegram={contactsData.telegram}
                  whatsapp={contactsData.whatsapp}
                  website={contactsData.website}
                  onSave={handleSaveField}
                />
              </div>

              {/* Статус приема клиентов */}
              <AcceptingClientsToggle
                acceptingClients={acceptingClients}
                onToggle={handleToggleAcceptingClients}
              />
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
          <div id="section-video" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
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
          <Section id="section-gallery" title="Галерея" icon="📸" iconBgColor="bg-green-100" iconTextColor="text-green-600">
            {isEditMode ? (
              <GalleryEditor
                items={data.gallery}
                onRefresh={() => router.refresh()}
              />
            ) : (
              data.gallery.length > 0 ? (
                <SpecialistGalleryContent items={data.gallery} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Галерея пуста</p>
                </div>
              )
            )}
          </Section>

          {/* Портфолио */}
          <Section id="section-portfolio" title="Портфолио" icon="💼" iconBgColor="bg-purple-100" iconTextColor="text-purple-600">
            {isEditMode ? (
              <PortfolioEditor
                items={data.portfolio}
                onRefresh={() => router.refresh()}
              />
            ) : (
              data.portfolio.length > 0 ? (
                <PortfolioContent items={data.portfolio} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Портфолио пусто</p>
                </div>
              )
            )}
          </Section>

          {/* Образование и сертификаты */}
          <Section id="section-education" title="Образование и сертификаты" icon="🎓" iconBgColor="bg-yellow-100" iconTextColor="text-yellow-600">
            <SpecialistEducationContent
              education={data.education}
              certificates={data.certificates}
              isEditMode={isEditMode}
              onRefresh={() => router.refresh()}
            />
          </Section>

          {/* Стоимость */}
          <Section id="section-pricing" title="Стоимость услуг" icon="💰" iconBgColor="bg-emerald-100" iconTextColor="text-emerald-600">
            <SpecialistPricingContent
              category={data.category}
              priceFrom={data.priceFrom}
              priceTo={data.priceTo}
              currency={data.currency}
              priceDescription={data.priceDescription}
              isEditMode={isEditMode}
              onSave={handleSaveField}
            />
          </Section>

          {/* FAQ */}
          <Section title="Часто задаваемые вопросы" icon="❓" iconBgColor="bg-indigo-100" iconTextColor="text-indigo-600">
            {isEditMode ? (
              <FAQEditor
                faqs={data.faqs}
                onRefresh={() => router.refresh()}
              />
            ) : (
              data.faqs.length > 0 ? (
                <SpecialistFAQContent faqs={data.faqs} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>FAQ не добавлены</p>
                </div>
              )
            )}
          </Section>

          {/* Услуги */}
          {data.services && data.services.length > 0 && (
            <Section title="Услуги" icon="💼" iconBgColor="bg-green-100" iconTextColor="text-green-600">
              <SpecialistServicesContent
                services={data.services}
                specialistSlug={data.slug}
              />
            </Section>
          )}

          {/* Лид-магниты */}
          <Section id="section-lead-magnets" title="Бесплатные материалы" icon="🎁" iconBgColor="bg-pink-100" iconTextColor="text-pink-600">
            {data.leadMagnets && data.leadMagnets.length > 0 ? (
              <SpecialistLeadMagnetsContent
                leadMagnets={data.leadMagnets}
                specialistSlug={data.slug}
                specialistName={data.fullName}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Лид-магниты не добавлены</p>
              </div>
            )}
          </Section>

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

