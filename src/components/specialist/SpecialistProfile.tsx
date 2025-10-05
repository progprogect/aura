'use client'

import * as React from 'react'
import { SpecialistTabs, useActiveTab, type Tab } from './SpecialistTabs'
import { SpecialistAbout } from './SpecialistAbout'
import { SpecialistSpecialization } from './SpecialistSpecialization'
import { SpecialistVideo } from './SpecialistVideo'
import { SpecialistGallery } from './SpecialistGallery'
import { SpecialistEducation } from './SpecialistEducation'
import { SpecialistPricing } from './SpecialistPricing'
import { SpecialistFAQ } from './SpecialistFAQ'
import { SpecialistContact } from './SpecialistContact'
import type { CategoryConfig } from '@/lib/category-config'

interface SpecialistProfileProps {
  tabs: Tab[]
  categoryConfig: CategoryConfig | null // Конфигурация категории из сервера
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

export function SpecialistProfile({ tabs, categoryConfig, data }: SpecialistProfileProps) {
  const activeTab = useActiveTab(tabs)

  return (
    <>
      {/* Табы */}
      <SpecialistTabs tabs={tabs} activeTab={activeTab} />

      {/* Основной контент */}
      <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
        {/* О себе */}
        <SpecialistAbout about={data.about} />

        {/* Специализация (условно) */}
        {data.customFields && categoryConfig && (
          <SpecialistSpecialization
            category={data.category}
            customFields={data.customFields}
            categoryConfig={categoryConfig}
          />
        )}

        {/* Видео-презентация */}
        {data.videoUrl && <SpecialistVideo videoUrl={data.videoUrl} />}

        {/* Галерея */}
        {data.gallery.length > 0 && <SpecialistGallery items={data.gallery} />}

        {/* Образование */}
        {(data.education.length > 0 || data.certificates.length > 0) && (
          <SpecialistEducation
            education={data.education}
            certificates={data.certificates}
          />
        )}

        {/* Стоимость */}
        {(data.priceFrom || data.priceTo) && (
          <SpecialistPricing
            category={data.category}
            priceFrom={data.priceFrom}
            priceTo={data.priceTo}
            currency={data.currency}
            priceDescription={data.priceDescription}
            priceLabel={categoryConfig?.priceLabel}
          />
        )}

        {/* FAQ */}
        {data.faqs.length > 0 && <SpecialistFAQ faqs={data.faqs} />}

        {/* Форма связи */}
        <SpecialistContact specialistId={data.id} specialistName={data.fullName} />
      </div>
    </>
  )
}



