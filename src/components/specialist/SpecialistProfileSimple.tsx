/**
 * Упрощенный профиль специалиста - все поля видны сразу
 * Без табов, все секции показываются всегда (даже если пустые)
 */

'use client'

import * as React from 'react'
import { SpecialistAbout } from './SpecialistAbout'
import { SpecialistSpecialization } from './SpecialistSpecialization'
import { SpecialistVideo } from './SpecialistVideo'
import { SpecialistGallery } from './SpecialistGallery'
import { SpecialistEducation } from './SpecialistEducation'
import { SpecialistPricing } from './SpecialistPricing'
import { SpecialistFAQ } from './SpecialistFAQ'
import { SpecialistContactForClients } from './SpecialistContactForClients'
import type { CategoryConfig } from '@/lib/category-config'

interface SpecialistProfileSimpleProps {
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
    // Новые поля для контактов
    contactEmail?: string | null
    contactPhone?: string | null
    contactTelegram?: string | null
    contactWhatsapp?: string | null
  }
  isEditMode?: boolean
  onSaveField?: (field: string, value: string | number) => Promise<any>
  onSaveCustomField?: (key: string, value: any) => Promise<any>
}

export function SpecialistProfileSimple({ 
  categoryConfig, 
  data, 
  isEditMode = false, 
  onSaveField, 
  onSaveCustomField 
}: SpecialistProfileSimpleProps) {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
      
      {/* О себе - ВСЕГДА показываем */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-sm">👤</span>
          </span>
          О себе
        </h2>
        <SpecialistAbout 
          about={data.about} 
          isEditMode={isEditMode}
          onSave={onSaveField}
        />
      </div>

      {/* Специализация - ВСЕГДА показываем если есть categoryConfig */}
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
            isEditMode={isEditMode}
            onSaveCustomField={onSaveCustomField}
          />
        </div>
      )}

      {/* Видео-презентация - ВСЕГДА показываем */}
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

      {/* Галерея - ВСЕГДА показываем */}
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

      {/* Образование и сертификаты - ВСЕГДА показываем */}
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
          isEditMode={isEditMode}
          onRefresh={() => window.location.reload()}
        />
      </div>

      {/* Стоимость - ВСЕГДА показываем */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <span className="text-emerald-600 text-sm">💰</span>
          </span>
          Стоимость услуг
        </h2>
        <SpecialistPricing
          priceFrom={data.priceFrom}
          priceTo={data.priceTo}
          currency={data.currency}
          priceDescription={data.priceDescription}
          isEditMode={isEditMode}
          onSave={onSaveField}
        />
      </div>

      {/* FAQ - ВСЕГДА показываем */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <span className="text-indigo-600 text-sm">❓</span>
          </span>
          Часто задаваемые вопросы
        </h2>
        <SpecialistFAQ
          faqs={data.faqs}
          isEditMode={isEditMode}
          onRefresh={() => window.location.reload()}
        />
      </div>

      {/* Контакты для связи - ВСЕГДА показываем */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-orange-600 text-sm">📞</span>
          </span>
          Контакты для связи
        </h2>
        <SpecialistContactForClients
          email={data.contactEmail}
          phone={data.contactPhone}
          telegram={data.contactTelegram}
          whatsapp={data.contactWhatsapp}
          isEditMode={isEditMode}
          onSave={onSaveField}
        />
      </div>

    </div>
  )
}
