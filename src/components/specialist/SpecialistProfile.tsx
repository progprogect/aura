'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { SpecialistTabs, useActiveTab, type Tab } from './SpecialistTabs'
import { SpecialistAbout } from './SpecialistAbout'
import { SpecialistSpecialization } from './SpecialistSpecialization'
import { SpecialistVideo } from './SpecialistVideo'
import { SpecialistGallery } from './SpecialistGallery'
import { SpecialistEducation } from './SpecialistEducation'
import { SpecialistPricing } from './SpecialistPricing'
import { SpecialistFAQ } from './SpecialistFAQ'
import { SpecialistContact } from './SpecialistContact'
import { SpecialistLeadMagnets } from './SpecialistLeadMagnets'
import { SpecialistServices } from './SpecialistServices'
import { ReviewList } from '@/components/reviews/ReviewList'
import type { CategoryConfig } from '@/lib/category-config'
import type { LeadMagnetUI } from '@/types/lead-magnet'
import type { Service } from '@/types/service'
import type { ReviewsResponse } from '@/types/review'

interface SpecialistProfileProps {
  tabs: Tab[]
  categoryConfig: CategoryConfig | null // Конфигурация категории из сервера
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
    leadMagnets?: LeadMagnetUI[]
    services?: Service[]
    averageRating?: number
    totalReviews?: number
    initialReviews?: ReviewsResponse
  }
  isEditMode?: boolean
  onSaveField?: (field: string, value: string | number) => Promise<any>
  onSaveCustomField?: (key: string, value: any) => Promise<any>
}

export function SpecialistProfile({ tabs, categoryConfig, data, isEditMode = false, onSaveField, onSaveCustomField }: SpecialistProfileProps) {
  const router = useRouter()
  const activeTab = useActiveTab(tabs)

  return (
    <>
      {/* Табы */}
      <SpecialistTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={(tabId) => {
          // Табы автоматически скроллят к секции через scrollToSection
        }}
      />

      {/* Основной контент */}
      <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
        {/* О себе */}
        <SpecialistAbout 
          about={data.about} 
          isEditMode={isEditMode}
          onSave={onSaveField}
        />

        {/* Специализация (условно) */}
        {(data.customFields || isEditMode) && categoryConfig && (
          <SpecialistSpecialization
            category={data.category}
            customFields={data.customFields}
            categoryConfig={categoryConfig}
            isEditMode={isEditMode}
            onSaveCustomField={onSaveCustomField}
          />
        )}

        {/* Видео-презентация */}
        {data.videoUrl && <SpecialistVideo videoUrl={data.videoUrl} />}

        {/* Галерея */}
        {data.gallery.length > 0 && <SpecialistGallery items={data.gallery} />}

        {/* Образование */}
        {(data.education.length > 0 || data.certificates.length > 0 || isEditMode) && (
          <SpecialistEducation
            education={data.education}
            certificates={data.certificates}
            isEditMode={isEditMode}
            onRefresh={() => router.refresh()}
          />
        )}

        {/* Стоимость */}
        {(data.priceFrom || data.priceTo || isEditMode) && (
          <SpecialistPricing
            category={data.category}
            priceFrom={data.priceFrom}
            priceTo={data.priceTo}
            currency={data.currency}
            priceDescription={data.priceDescription}
            priceLabel={categoryConfig?.priceLabel}
            isEditMode={isEditMode}
            onSave={onSaveField}
          />
        )}

        {/* FAQ */}
        {data.faqs.length > 0 && <SpecialistFAQ faqs={data.faqs} />}

        {/* Услуги */}
        {data.services && data.services.length > 0 && (
          <SpecialistServices
            services={data.services}
            specialistSlug={data.slug}
          />
        )}

        {/* Лид-магниты */}
        {data.leadMagnets && data.leadMagnets.length > 0 && (
          <SpecialistLeadMagnets
            leadMagnets={data.leadMagnets}
            specialistSlug={data.slug}
            specialistName={data.fullName}
          />
        )}

        {/* Отзывы */}
        {data.totalReviews && data.totalReviews > 0 && !isEditMode && (
          <ReviewList
            specialistId={data.id}
            initialReviews={data.initialReviews}
          />
        )}

        {/* Форма связи */}
        <SpecialistContact specialistId={data.id} specialistName={data.fullName} />
      </div>
    </>
  )
}



